import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Filter, Search, Users, Settings } from 'lucide-react';
import { boardsAPI, tasksAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { groupTasksByStatus } from '../utils/helpers';
import toast from 'react-hot-toast';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import BoardHeader from '../components/BoardHeader';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    joinBoard, 
    leaveBoard, 
    onTaskCreated, 
    onTaskUpdated, 
    onTaskDeleted,
    emitTaskPositionChanged 
  } = useSocket();
  
  const { isGuest } = useAuth();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    assignedTo: '',
    priority: '',
    overdue: false
  });

  useEffect(() => {
    fetchBoard();
    
    // Only set up real-time features for authenticated users
    if (!isGuest) {
      // Join board for real-time updates
      if (id) {
        joinBoard(id);
      }

      // Set up socket listeners
      const unsubscribeTaskCreated = onTaskCreated((data) => {
        if (data.boardId === id) {
          fetchBoard(); // Refresh board data
        }
      });

      const unsubscribeTaskUpdated = onTaskUpdated((data) => {
        if (data.boardId === id) {
          fetchBoard(); // Refresh board data
        }
      });

      const unsubscribeTaskDeleted = onTaskDeleted((data) => {
        if (data.boardId === id) {
          fetchBoard(); // Refresh board data
        }
      });

      return () => {
        if (id) {
          leaveBoard(id);
        }
        if (unsubscribeTaskCreated) unsubscribeTaskCreated();
        if (unsubscribeTaskUpdated) unsubscribeTaskUpdated();
        if (unsubscribeTaskDeleted) unsubscribeTaskDeleted();
      };
    }
  }, [id, isGuest, joinBoard, leaveBoard, onTaskCreated, onTaskUpdated, onTaskDeleted, fetchBoard]);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await boardsAPI.getBoard(id);
      setBoard(response.data.board);
      setTasks(response.data.tasks);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Board not found');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load board');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If no destination, return
    if (!destination) return;

    // If dropped in the same position, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create a copy of tasks
    const newTasks = { ...tasks };
    const sourceList = [...newTasks[source.droppableId]];
    const destList = source.droppableId === destination.droppableId 
      ? sourceList 
      : [...newTasks[destination.droppableId]];

    // Remove task from source
    const [movedTask] = sourceList.splice(source.index, 1);

    // Add task to destination
    const updatedTask = { ...movedTask, status: destination.droppableId };
    destList.splice(destination.index, 0, updatedTask);

    // Update the tasks state
    newTasks[source.droppableId] = sourceList;
    newTasks[destination.droppableId] = destList;
    setTasks(newTasks);

    // Emit socket event for real-time updates (only for authenticated users)
    if (!isGuest) {
      emitTaskPositionChanged(
        draggableId, 
        destination.droppableId, 
        destination.index, 
        id
      );
    }

    try {
      // Update task on server
      await tasksAPI.updateTask(draggableId, {
        status: destination.droppableId,
        position: destination.index
      });
    } catch (error) {
      // Revert the change if API call fails
      setTasks(tasks);
      toast.error('Failed to update task position');
    }
  };

  const handleTaskCreated = (newTask) => {
    const updatedTasks = { ...tasks };
    updatedTasks[newTask.status].unshift(newTask);
    setTasks(updatedTasks);
    setShowCreateTask(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    fetchBoard(); // Refresh to get latest data
    setSelectedTask(null);
  };

  const handleTaskDeleted = () => {
    fetchBoard(); // Refresh to get latest data
    setSelectedTask(null);
  };

  // Filter tasks based on search and filters
  const filterTasks = (taskList) => {
    return taskList.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo && task.assignedTo?._id !== filters.assignedTo) {
        return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Overdue filter
      if (filters.overdue && (!task.dueDate || new Date(task.dueDate) >= new Date() || task.status === 'done')) {
        return false;
      }

      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Board not found</h2>
          <p className="text-gray-600">The board you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const filteredTasks = {
    todo: filterTasks(tasks.todo || []),
    inprogress: filterTasks(tasks.inprogress || []),
    done: filterTasks(tasks.done || [])
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center max-w-7xl mx-auto">
            <Info className="h-4 w-4 text-amber-600 mr-2" />
            <p className="text-sm text-amber-700">
              Guest mode: Changes are saved locally only. 
              <Link to="/signup" className="font-medium underline hover:text-amber-800 ml-1">
                Sign up
              </Link> to sync across devices.
            </p>
          </div>
        </div>
      )}

      {/* Board Header */}
      <BoardHeader 
        board={board} 
        onBoardUpdated={setBoard}
        onCreateTask={() => setShowCreateTask(true)}
      />

      {/* Filters and Search */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          {/* Board Actions */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Users size={16} />
              <span>Members</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={filteredTasks.todo}
              onTaskClick={setSelectedTask}
              onAddTask={() => setShowCreateTask('todo')}
            />
            <TaskColumn
              title="In Progress"
              status="inprogress"
              tasks={filteredTasks.inprogress}
              onTaskClick={setSelectedTask}
              onAddTask={() => setShowCreateTask('inprogress')}
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={filteredTasks.done}
              onTaskClick={setSelectedTask}
              onAddTask={() => setShowCreateTask('done')}
            />
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          boardId={id}
          initialStatus={typeof showCreateTask === 'string' ? showCreateTask : 'todo'}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          boardId={id}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default Board;