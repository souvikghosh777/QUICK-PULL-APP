import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import './styles/globals.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<><Navbar /><main className="pt-16"><Landing /></main></>} />
              <Route path="/login" element={<><Navbar /><main className="pt-16"><Login /></main></>} />
              <Route path="/signup" element={<><Navbar /><main className="pt-16"><Signup /></main></>} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Dashboard />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/board/:id" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Board />
                  </main>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<><Navbar /><main className="pt-16"><NotFound /></main></>} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4aed88',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#ff6b6b',
                  },
                },
              }}
            />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;