import React, { useState } from 'react';
import { X } from 'lucide-react';
import { boardsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateBoardModal = ({ onClose, onBoardCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Board title is required');
      return;
    }

    setLoading(true);

    try {
      const response = await boardsAPI.createBoard(formData);
      onBoardCreated(response.data.board);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Board</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Board Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter board title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Board Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this board is for"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Board Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Board Color
            </label>
            <div className="flex items-center space-x-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-gray-400 scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Board Visibility */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Make board public
                </span>
                <p className="text-xs text-gray-500">
                  Anyone with the link can view this board
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2" style={{ width: '16px', height: '16px' }}></div>
                  Creating...
                </div>
              ) : (
                'Create Board'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;