import axios from 'axios';
import guestStorage from './guestStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to check if user is a guest
const isGuestUser = () => {
  return localStorage.getItem('isGuest') === 'true';
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  signup: (name, email, password) => 
    api.post('/auth/signup', { name, email, password }),
};

// Boards API
export const boardsAPI = {
  getBoards: () => {
    if (isGuestUser()) {
      guestStorage.initializeSampleData();
      const boards = guestStorage.getBoards();
      return Promise.resolve({ data: { boards } });
    }
    return api.get('/api/boards');
  },
  
  getBoard: (id) => {
    if (isGuestUser()) {
      const boards = guestStorage.getBoards();
      const board = boards.find(b => b._id === id);
      const tasks = guestStorage.getTasks(id);
      if (board) {
        return Promise.resolve({ data: { board, tasks } });
      }
      return Promise.reject({ response: { status: 404 } });
    }
    return api.get(`/api/boards/${id}`);
  },
  
  createBoard: (boardData) => {
    if (isGuestUser()) {
      const board = guestStorage.createBoard(boardData);
      return Promise.resolve({ data: { board } });
    }
    return api.post('/api/boards', boardData);
  },
  
  updateBoard: (id, boardData) => {
    if (isGuestUser()) {
      const board = guestStorage.updateBoard(id, boardData);
      return Promise.resolve({ data: { board } });
    }
    return api.patch(`/api/boards/${id}`, boardData);
  },
  
  deleteBoard: (id) => {
    if (isGuestUser()) {
      guestStorage.deleteBoard(id);
      return Promise.resolve({ data: { message: 'Board deleted successfully' } });
    }
    return api.delete(`/api/boards/${id}`);
  },
};

// Tasks API
export const tasksAPI = {
  createTask: (boardId, taskData) => {
    if (isGuestUser()) {
      const task = guestStorage.createTask(boardId, taskData);
      return Promise.resolve({ data: { task } });
    }
    return api.post(`/api/boards/${boardId}/tasks`, taskData);
  },
  
  updateTask: (id, taskData) => {
    if (isGuestUser()) {
      // For guest users, we need to find which board the task belongs to
      // We'll extract the board ID from the current URL or context
      const boardId = window.location.pathname.split('/board/')[1];
      const task = guestStorage.updateTask(boardId, id, taskData);
      return Promise.resolve({ data: { task } });
    }
    return api.patch(`/api/tasks/${id}`, taskData);
  },
  
  deleteTask: (id) => {
    if (isGuestUser()) {
      const boardId = window.location.pathname.split('/board/')[1];
      guestStorage.deleteTask(boardId, id);
      return Promise.resolve({ data: { message: 'Task deleted successfully' } });
    }
    return api.delete(`/api/tasks/${id}`);
  },
  
  addComment: (id, commentData) => {
    if (isGuestUser()) {
      const boardId = window.location.pathname.split('/board/')[1];
      const task = guestStorage.addComment(boardId, id, commentData);
      return Promise.resolve({ data: { task } });
    }
    return api.post(`/api/tasks/${id}/comments`, commentData);
  },
};

export default api;