import React, { useState } from 'react';
import { X, Calendar, User, Flag, MessageCircle, Trash2, Edit } from 'lucide-react';
import { tasksAPI } from '../services/api';
import { formatDate, getPriorityColor, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const TaskModal = ({ task, boardId, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    tags: task.tags ? task.tags.join(', ') : ''
  });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (!updateData.dueDate) {
        delete updateData.dueDate;
      }

      const response = await tasksAPI.updateTask(task._id, updateData);
      onTaskUpdated(response.data.task);
      setIsEditing(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await tasksAPI.deleteTask(task._id);
        onTaskDeleted();
        toast.success('Task deleted successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await tasksAPI.addComment(task._id, { text: newComment });
      setNewComment('');
      // Refresh task data
      onTaskUpdated(task);
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Enter tags separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Task'}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600">{task.description}</p>
                )}
              </div>

              {/* Task Meta Information */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center space-x-2">
                  <Flag size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium capitalize">{task.status.replace('inprogress', 'In Progress')}</span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Due:</span>
                    <span className="text-sm font-medium">{formatDate(task.dueDate)}</span>
                  </div>
                )}

                {task.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Assigned to:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                        {getInitials(task.assignedTo.name)}
                      </div>
                      <span className="text-sm font-medium">{task.assignedTo.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{formatDate(task.createdAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <MessageCircle size={16} />
                  <span>Comments ({task.comments?.length || 0})</span>
                </h4>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex space-x-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={commentLoading || !newComment.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 h-fit"
                    >
                      {commentLoading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {task.comments?.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                        {getInitials(comment.author.name)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.author.name}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;