import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import MyOrders from './pages/MyOrders';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#F0F7F2' }}>
        {children}
      </div>
    </>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create"    element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/orders"    element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/"          element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}