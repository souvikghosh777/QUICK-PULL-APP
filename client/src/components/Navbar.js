import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, Home, Settings, User, Wifi, WifiOff } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isGuest, loginAsGuest } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  if (!isAuthenticated()) {
    // Show minimal navbar for auth pages
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TaskSync</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGuestLogin}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Continue as Guest
              </button>
              {location.pathname === '/login' ? (
                <Link 
                  to="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up
                </Link>
              ) : (
                <Link 
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TaskSync</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Right side - User menu and status */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi size={16} />
                  <span className="hidden sm:inline text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff size={16} />
                  <span className="hidden sm:inline text-sm">Disconnected</span>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isGuest && (
                      <p className="text-xs text-amber-600 mt-1">Guest Mode</p>
                    )}
                  </div>
                  
                  {isGuest ? (
                    <>
                      <Link 
                        to="/login"
                        className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 flex items-center space-x-2"
                      >
                        <User size={16} />
                        <span>Sign Up / Log In</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <User size={16} />
                        <span>Profile</span>
                      </button>
                      
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                    </>
                  )}
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>{isGuest ? 'Exit Guest Mode' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;