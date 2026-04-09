import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Buyer components
import BuyerNavbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import MyOrders from './pages/MyOrders';

// Farmer components
import FarmerNavbar from './components/FarmerNavbar';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerCreateListing from './pages/FarmerCreateListing';
import FarmerOrders from './pages/FarmerOrders';

function BuyerLayout({ children }) {
  return (
    <>
      <BuyerNavbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#F0F4F8' }}>
        {children}
      </div>
    </>
  );
}

function FarmerLayout({ children }) {
  return (
    <>
      <FarmerNavbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: '#F0F7F2' }}>
        {children}
      </div>
    </>
  );
}

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/dashboard'} replace />;
  }
  const Layout = user.role === 'farmer' ? FarmerLayout : BuyerLayout;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer routes */}
          <Route path="/dashboard" element={<PrivateRoute role="buyer"><Marketplace /></PrivateRoute>} />
          <Route path="/orders"    element={<PrivateRoute role="buyer"><MyOrders /></PrivateRoute>} />

          {/* Farmer routes */}
          <Route path="/farmer/dashboard" element={<PrivateRoute role="farmer"><FarmerDashboard /></PrivateRoute>} />
          <Route path="/farmer/create"    element={<PrivateRoute role="farmer"><FarmerCreateListing /></PrivateRoute>} />
          <Route path="/farmer/orders"    element={<PrivateRoute role="farmer"><FarmerOrders /></PrivateRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}