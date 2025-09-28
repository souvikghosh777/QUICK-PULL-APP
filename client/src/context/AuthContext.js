import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedGuestStatus = localStorage.getItem('isGuest');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsGuest(storedGuestStatus === 'true');
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@example.com',
      isGuest: true
    };
    
    const guestToken = 'guest-token-' + Date.now();
    
    localStorage.setItem('token', guestToken);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isGuest', 'true');
    
    setToken(guestToken);
    setUser(guestUser);
    setIsGuest(true);
    
    // Don't set Authorization header for guest users
    return { success: true, data: { token: guestToken, user: guestUser } };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    isGuest,
    login,
    signup,
    loginAsGuest,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};