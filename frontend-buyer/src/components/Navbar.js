import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#1A56A0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
        🌾 FarmConnect Rwanda
      </Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: '#A8CCF0', textDecoration: 'none', fontSize: '15px' }}>Marketplace</Link>
        <Link to="/orders" style={{ color: '#A8CCF0', textDecoration: 'none', fontSize: '15px' }}>My Orders</Link>
        <span style={{ color: 'white', fontSize: '14px' }}>👤 {user?.name}</span>
        <button onClick={handleLogout}
          style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}