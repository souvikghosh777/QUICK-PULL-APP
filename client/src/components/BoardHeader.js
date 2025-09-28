import React, { useState } from 'react';
import { MoreHorizontal, Edit, Palette, Share } from 'lucide-react';
import { formatRelativeDate, getInitials } from '../utils/helpers';

const BoardHeader = ({ board, onBoardUpdated, onCreateTask }) => {
  const [showMenu, setShowMenu] = useState(false);

  const totalTasks = (board.stats?.total || 0);
  const completedTasks = (board.stats?.done || 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Board info */}
        <div className="flex items-center space-x-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: board.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-gray-600">{board.description}</p>
            )}
          </div>
        </div>

        {/* Right side - Actions and stats */}
        <div className="flex items-center space-x-6">
          {/* Progress */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>

          {/* Task stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{completedTasks}/{totalTasks} tasks</span>
            <span>•</span>
            <span>Updated {formatRelativeDate(board.updatedAt)}</span>
          </div>

          {/* Members */}
          {board.members && board.members.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {board.members.slice(0, 4).map((member) => (
                  <div
                    key={member.user._id}
                    className="w-8 h-8 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center text-sm font-medium text-white"
                    title={member.user.name}
                  >
                    {getInitials(member.user.name)}
                  </div>
                ))}
                {board.members.length > 4 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{board.members.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Task Button */}
          <button
            onClick={onCreateTask}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Add Task
          </button>

          {/* Board Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Edit size={16} />
                    <span>Edit Board</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Palette size={16} />
                    <span>Change Color</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Share size={16} />
                    <span>Share Board</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;