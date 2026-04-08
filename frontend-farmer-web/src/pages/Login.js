import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      if (res.data.user.role !== 'farmer') {
        setError('This portal is for farmers only.');
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>🌱</div>
        <h1 style={{ textAlign: 'center', color: '#1A7A3C', margin: '0 0 4px', fontSize: '24px' }}>FarmConnect Rwanda</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px' }}>Farmer Portal</p>

        {error && <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Phone Number</label>
          <input type="tel" placeholder="e.g. 0789123456" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} required />

          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Password</label>
          <input type="password" placeholder="Your password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} required />

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In as Farmer'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          No account? <Link to="/register" style={{ color: '#1A7A3C' }}>Register as Farmer</Link>
        </p>
      </div>
    </div>
  );
}