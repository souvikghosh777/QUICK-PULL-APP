import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { loginAsGuest } = useAuth();

  const handleGuestAccess = () => {
    loginAsGuest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">TS</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Collaborate on tasks in{' '}
            <span className="text-primary-600">real-time</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            TaskSync helps teams organize, track, and complete projects together. 
            Create boards, manage tasks, and stay in sync with your team.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/signup"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Link>
            
            <button
              onClick={handleGuestAccess}
              className="px-8 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
            >
              Try as Guest
            </button>
          </div>

          {/* Demo Image Placeholder */}
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">TaskSync Board Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-lg text-gray-600">
            Simple, powerful tools for team collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Task Management
            </h3>
            <p className="text-gray-600">
              Create, organize, and track tasks with our intuitive Kanban-style boards. 
              Set priorities, due dates, and add detailed descriptions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Invite team members, assign tasks, and collaborate in real-time. 
              Stay updated with comments and notifications.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Real-time Updates
            </h3>
            <p className="text-gray-600">
              See changes instantly as your team works. No refresh needed - 
              everything syncs automatically across all devices.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get organized?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of teams already using TaskSync
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-primary-400 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;