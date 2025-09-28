import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, CheckCircle } from 'lucide-react';
import { boardsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatRelativeDate, calculateProgress } from '../utils/helpers';
import toast from 'react-hot-toast';
import CreateBoardModal from '../components/CreateBoardModal';
import ProgressChart from '../components/ProgressChart';
import { Info } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isGuest } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await boardsAPI.getBoards();
      setBoards(response.data.boards);
    } catch (error) {
      toast.error('Failed to fetch boards');
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardCreated = (newBoard) => {
    setBoards(prev => [newBoard, ...prev]);
    setShowCreateModal(false);
    toast.success('Board created successfully!');
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-amber-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">Guest Mode</h3>
              <p className="text-sm text-amber-700 mt-1">
                You're using TaskSync as a guest. Your data is stored locally and won't be synced across devices. 
                <Link to="/signup" className="font-medium underline hover:text-amber-800 ml-1">
                  Create an account
                </Link> to save your work permanently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your projects and collaborate with your team
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Boards</p>
              <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {boards.reduce((sum, board) => sum + (board.stats?.total || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {boards.reduce((sum, board) => sum + (board.stats?.done || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Boards</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Board</span>
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No boards yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first board to start managing tasks
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="responsive-grid">
          {boards.map((board) => {
            const progress = board.stats?.total > 0 
              ? Math.round((board.stats.done / board.stats.total) * 100) 
              : 0;

            return (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="card-hover block"
              >
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  {/* Board Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {board.title}
                      </h3>
                      {board.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {board.description}
                        </p>
                      )}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: board.color }}
                    />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm text-gray-500">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Board Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <CheckCircle size={14} />
                        <span>{board.stats?.total || 0} tasks</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{board.members?.length || 0} members</span>
                      </span>
                    </div>
                    <span>{formatRelativeDate(board.updatedAt)}</span>
                  </div>

                  {/* Members Avatars */}
                  {board.members && board.members.length > 0 && (
                    <div className="flex items-center mt-3">
                      <div className="flex -space-x-2">
                        {board.members.slice(0, 3).map((member, index) => {
                          // Handle different member structures (backend vs guest storage)
                          const memberName = member.user?.name || member.name || 'Unknown';
                          const memberId = member.user?._id || member.userId || `member-${index}`;
                          
                          return (
                            <div
                              key={memberId}
                              className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                              title={memberName}
                            >
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                          );
                        })}
                        {board.members.length > 3 && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            +{board.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      {boards.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Progress Overview
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ProgressChart boards={boards} />
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onBoardCreated={handleBoardCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;