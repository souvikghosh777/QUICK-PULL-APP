import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Calendar, User } from 'lucide-react';
import { formatRelativeDate, getPriorityColor, isOverdue, getDueDateColor, getInitials } from '../utils/helpers';

const TaskColumn = ({ title, status, tasks, onTaskClick, onAddTask }) => {
  const getColumnColor = () => {
    switch (status) {
      case 'todo': return 'bg-gray-50 border-gray-200';
      case 'inprogress': return 'bg-blue-50 border-blue-200';
      case 'done': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getColumnHeaderColor = () => {
    switch (status) {
      case 'todo': return 'text-gray-700';
      case 'inprogress': return 'text-blue-700';
      case 'done': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={`${getColumnColor()} rounded-lg border p-4 h-fit min-h-[500px]`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${getColumnHeaderColor()}`}>
            {title}
          </h3>
          <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 min-h-[400px] ${
              snapshot.isDraggingOver ? 'drop-zone-active' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <TaskCard task={task} onClick={() => onTaskClick(task)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No tasks yet</p>
                <button
                  onClick={onAddTask}
                  className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                >
                  Add your first task
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const TaskCard = ({ task, onClick }) => {
  const isTaskOverdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer priority-${task.priority}`}
    >
      {/* Task Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Task Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Priority Badge */}
          <span className={`px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 ${getDueDateColor(task.dueDate, task.status)}`}>
              <Calendar size={12} />
              <span className={isTaskOverdue ? 'font-medium' : ''}>
                {formatRelativeDate(task.dueDate)}
                {isTaskOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>

        {/* Assigned User */}
        {task.assignedTo && (
          <div className="flex items-center space-x-1">
            <User size={12} />
            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {getInitials(task.assignedTo.name)}
            </div>
          </div>
        )}
      </div>

      {/* Comments count */}
      {task.comments && task.comments.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TaskColumn;