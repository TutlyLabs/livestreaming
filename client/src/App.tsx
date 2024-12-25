import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { PrivateRoute } from './components/PrivateRoute';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { StreamView } from './pages/StreamView';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StreamAnalyticsView } from "./pages/StreamAnalyticsView";
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/stream/:streamId" element={<StreamView />} />
            <Route path="/stream/:streamId/analytics" element={<StreamAnalyticsView />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;