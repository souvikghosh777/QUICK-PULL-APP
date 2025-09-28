const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // Store user connection
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      joinedBoards: new Set()
    });

    // Join board room
    socket.on('join-board', (boardId) => {
      if (!boardId) return;
      
      socket.join(`board_${boardId}`);
      
      // Track which boards user has joined
      const userConnection = connectedUsers.get(socket.user._id.toString());
      if (userConnection) {
        userConnection.joinedBoards.add(boardId);
      }

      console.log(`👤 ${socket.user.name} joined board: ${boardId}`);

      // Notify other users in the board
      socket.to(`board_${boardId}`).emit('user-joined-board', {
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        boardId
      });
    });

    // Leave board room
    socket.on('leave-board', (boardId) => {
      if (!boardId) return;
      
      socket.leave(`board_${boardId}`);
      
      // Remove from tracked boards
      const userConnection = connectedUsers.get(socket.user._id.toString());
      if (userConnection) {
        userConnection.joinedBoards.delete(boardId);
      }

      console.log(`👤 ${socket.user.name} left board: ${boardId}`);

      // Notify other users in the board
      socket.to(`board_${boardId}`).emit('user-left-board', {
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        boardId
      });
    });

    // Handle typing indicators for comments
    socket.on('typing-start', (data) => {
      socket.to(`board_${data.boardId}`).emit('user-typing', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        taskId: data.taskId,
        boardId: data.boardId
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`board_${data.boardId}`).emit('user-stopped-typing', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        taskId: data.taskId,
        boardId: data.boardId
      });
    });

    // Handle task position changes for drag-and-drop
    socket.on('task-position-changed', (data) => {
      socket.to(`board_${data.boardId}`).emit('task-position-updated', {
        taskId: data.taskId,
        newStatus: data.newStatus,
        newPosition: data.newPosition,
        boardId: data.boardId,
        updatedBy: {
          id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    // Handle real-time cursor/activity indicators
    socket.on('user-activity', (data) => {
      socket.to(`board_${data.boardId}`).emit('user-activity-update', {
        user: {
          id: socket.user._id,
          name: socket.user.name
        },
        activity: data.activity, // 'viewing-task', 'editing-task', etc.
        taskId: data.taskId,
        boardId: data.boardId,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`👤 User ${socket.user.name} disconnected: ${reason}`);

      // Get user's joined boards and notify others
      const userConnection = connectedUsers.get(socket.user._id.toString());
      if (userConnection) {
        userConnection.joinedBoards.forEach(boardId => {
          socket.to(`board_${boardId}`).emit('user-disconnected', {
            user: {
              id: socket.user._id,
              name: socket.user.name,
              email: socket.user.email
            },
            boardId
          });
        });
      }

      // Remove user from connected users
      connectedUsers.delete(socket.user._id.toString());
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const staleConnections = [];
    connectedUsers.forEach((connection, userId) => {
      const socket = io.sockets.sockets.get(connection.socketId);
      if (!socket || !socket.connected) {
        staleConnections.push(userId);
      }
    });
    
    staleConnections.forEach(userId => {
      connectedUsers.delete(userId);
    });
    
    if (staleConnections.length > 0) {
      console.log(`🧹 Cleaned up ${staleConnections.length} stale connections`);
    }
  }, 30000); // Every 30 seconds

  // Make connectedUsers available globally
  io.connectedUsers = connectedUsers;
};

module.exports = socketHandler;