// Local storage service for guest users
class LocalStorageService {
  constructor() {
    this.prefix = 'tasksync_guest_';
  }

  // Boards
  getBoards() {
    const boards = localStorage.getItem(`${this.prefix}boards`);
    const boardsData = boards ? JSON.parse(boards) : [];
    
    // Add stats to each board
    return boardsData.map(board => {
      const tasks = this.getTasks(board._id);
      const stats = {
        total: 0,
        todo: tasks.todo ? tasks.todo.length : 0,
        inprogress: tasks.inprogress ? tasks.inprogress.length : 0,
        done: tasks.done ? tasks.done.length : 0
      };
      stats.total = stats.todo + stats.inprogress + stats.done;
      
      return {
        ...board,
        stats
      };
    });
  }

  saveBoards(boards) {
    // Remove stats before saving (they're calculated dynamically)
    const boardsToSave = boards.map(board => {
      const { stats, ...boardWithoutStats } = board;
      return boardWithoutStats;
    });
    localStorage.setItem(`${this.prefix}boards`, JSON.stringify(boardsToSave));
  }

  createBoard(board) {
    // Get raw boards (without stats)
    const boards = localStorage.getItem(`${this.prefix}boards`);
    const boardsData = boards ? JSON.parse(boards) : [];
    
    const newBoard = {
      ...board,
      _id: 'guest_board_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [{
        user: {
          _id: 'guest-user',
          name: 'Guest User',
          email: 'guest@example.com'
        },
        role: 'owner'
      }]
    };
    
    boardsData.push(newBoard);
    localStorage.setItem(`${this.prefix}boards`, JSON.stringify(boardsData));
    
    // Return board with stats
    return {
      ...newBoard,
      stats: {
        total: 0,
        todo: 0,
        inprogress: 0,
        done: 0
      }
    };
  }

  updateBoard(boardId, updates) {
    const boards = this.getBoards();
    const boardIndex = boards.findIndex(b => b._id === boardId);
    if (boardIndex !== -1) {
      boards[boardIndex] = {
        ...boards[boardIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveBoards(boards);
      return boards[boardIndex];
    }
    return null;
  }

  deleteBoard(boardId) {
    const boards = this.getBoards();
    const filteredBoards = boards.filter(b => b._id !== boardId);
    this.saveBoards(filteredBoards);
    // Also delete associated tasks
    this.saveTasks(boardId, []);
  }

  // Tasks
  getTasks(boardId) {
    const tasks = localStorage.getItem(`${this.prefix}tasks_${boardId}`);
    return tasks ? JSON.parse(tasks) : { todo: [], inprogress: [], done: [] };
  }

  saveTasks(boardId, tasks) {
    localStorage.setItem(`${this.prefix}tasks_${boardId}`, JSON.stringify(tasks));
  }

  createTask(boardId, task) {
    const tasks = this.getTasks(boardId);
    const newTask = {
      ...task,
      _id: 'guest_task_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: []
    };
    
    if (!tasks[task.status]) {
      tasks[task.status] = [];
    }
    tasks[task.status].unshift(newTask);
    this.saveTasks(boardId, tasks);
    return newTask;
  }

  updateTask(boardId, taskId, updates) {
    const tasks = this.getTasks(boardId);
    let updatedTask = null;
    
    // Find and update task in any status column
    Object.keys(tasks).forEach(status => {
      const taskIndex = tasks[status].findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        updatedTask = {
          ...tasks[status][taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // If status changed, move task to new column
        if (updates.status && updates.status !== status) {
          tasks[status].splice(taskIndex, 1);
          if (!tasks[updates.status]) {
            tasks[updates.status] = [];
          }
          tasks[updates.status].push(updatedTask);
        } else {
          tasks[status][taskIndex] = updatedTask;
        }
      }
    });
    
    if (updatedTask) {
      this.saveTasks(boardId, tasks);
    }
    return updatedTask;
  }

  deleteTask(boardId, taskId) {
    const tasks = this.getTasks(boardId);
    
    // Find and remove task from any status column
    Object.keys(tasks).forEach(status => {
      const taskIndex = tasks[status].findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        tasks[status].splice(taskIndex, 1);
      }
    });
    
    this.saveTasks(boardId, tasks);
  }

  addComment(boardId, taskId, comment) {
    const tasks = this.getTasks(boardId);
    let updatedTask = null;
    
    Object.keys(tasks).forEach(status => {
      const taskIndex = tasks[status].findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        const newComment = {
          _id: 'guest_comment_' + Date.now(),
          text: comment.text,
          author: {
            _id: 'guest-user',
            name: 'Guest User',
            email: 'guest@example.com'
          },
          createdAt: new Date().toISOString()
        };
        
        if (!tasks[status][taskIndex].comments) {
          tasks[status][taskIndex].comments = [];
        }
        tasks[status][taskIndex].comments.unshift(newComment);
        tasks[status][taskIndex].updatedAt = new Date().toISOString();
        updatedTask = tasks[status][taskIndex];
      }
    });
    
    if (updatedTask) {
      this.saveTasks(boardId, tasks);
    }
    return updatedTask;
  }

  // Clear all guest data
  clearAllData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Initialize with sample data
  initializeSampleData() {
    const boards = this.getBoards();
    if (boards.length === 0) {
      // Create a sample board
      const sampleBoard = this.createBoard({
        title: 'My First Board',
        description: 'Welcome to TaskSync! This is your sample board to get started.',
        color: '#3B82F6'
      });

      // Create sample tasks
      this.createTask(sampleBoard._id, {
        title: 'Welcome to TaskSync!',
        description: 'This is your first task. Click on it to edit or add comments.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      });

      this.createTask(sampleBoard._id, {
        title: 'Explore drag and drop',
        description: 'Try dragging this task between columns to change its status.',
        status: 'inprogress',
        priority: 'low'
      });

      this.createTask(sampleBoard._id, {
        title: 'Create your own tasks',
        description: 'Click the + button in any column to create new tasks.',
        status: 'done',
        priority: 'high'
      });
    }
  }
}

const guestStorage = new LocalStorageService();
export default guestStorage;