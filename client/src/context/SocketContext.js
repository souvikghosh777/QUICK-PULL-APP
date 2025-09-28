import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated() && token && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setConnected(true);
        toast.success('Connected to server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        setConnected(false);
        if (reason !== 'io client disconnect') {
          toast.error('Disconnected from server');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
        toast.error('Connection failed');
      });

      // Real-time event handlers
      newSocket.on('user-joined-board', (data) => {
        toast.success(`${data.user.name} joined the board`);
      });

      newSocket.on('user-left-board', (data) => {
        toast(`${data.user.name} left the board`, { icon: '👋' });
      });

      newSocket.on('task-created', (data) => {
        toast.success('New task created');
      });

      newSocket.on('task-updated', (data) => {
        toast.success('Task updated');
      });

      newSocket.on('task-deleted', (data) => {
        toast.success('Task deleted');
      });

      newSocket.on('task-comment-added', (data) => {
        toast.success('New comment added');
      });

      newSocket.on('user-typing', (data) => {
        // Handle typing indicators
        console.log(`${data.user.name} is typing...`);
      });

      newSocket.on('user-stopped-typing', (data) => {
        // Handle stop typing indicators
        console.log(`${data.user.name} stopped typing`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      // If user logs out, close socket connection
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [isAuthenticated, token, user]);

  const joinBoard = (boardId) => {
    if (socket && boardId) {
      socket.emit('join-board', boardId);
    }
  };

  const leaveBoard = (boardId) => {
    if (socket && boardId) {
      socket.emit('leave-board', boardId);
    }
  };

  const emitTaskPositionChanged = (taskId, newStatus, newPosition, boardId) => {
    if (socket) {
      socket.emit('task-position-changed', {
        taskId,
        newStatus,
        newPosition,
        boardId
      });
    }
  };

  const emitTypingStart = (taskId, boardId) => {
    if (socket) {
      socket.emit('typing-start', { taskId, boardId });
    }
  };

  const emitTypingStop = (taskId, boardId) => {
    if (socket) {
      socket.emit('typing-stop', { taskId, boardId });
    }
  };

  const emitUserActivity = (activity, taskId, boardId) => {
    if (socket) {
      socket.emit('user-activity', { activity, taskId, boardId });
    }
  };

  // Subscribe to real-time events
  const onTaskCreated = (callback) => {
    if (socket) {
      socket.on('task-created', callback);
      return () => socket.off('task-created', callback);
    }
  };

  const onTaskUpdated = (callback) => {
    if (socket) {
      socket.on('task-updated', callback);
      return () => socket.off('task-updated', callback);
    }
  };

  const onTaskDeleted = (callback) => {
    if (socket) {
      socket.on('task-deleted', callback);
      return () => socket.off('task-deleted', callback);
    }
  };

  const onTaskCommentAdded = (callback) => {
    if (socket) {
      socket.on('task-comment-added', callback);
      return () => socket.off('task-comment-added', callback);
    }
  };

  const onTaskPositionUpdated = (callback) => {
    if (socket) {
      socket.on('task-position-updated', callback);
      return () => socket.off('task-position-updated', callback);
    }
  };

  const onUserJoinedBoard = (callback) => {
    if (socket) {
      socket.on('user-joined-board', callback);
      return () => socket.off('user-joined-board', callback);
    }
  };

  const onUserLeftBoard = (callback) => {
    if (socket) {
      socket.on('user-left-board', callback);
      return () => socket.off('user-left-board', callback);
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    joinBoard,
    leaveBoard,
    emitTaskPositionChanged,
    emitTypingStart,
    emitTypingStop,
    emitUserActivity,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskCommentAdded,
    onTaskPositionUpdated,
    onUserJoinedBoard,
    onUserLeftBoard
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};