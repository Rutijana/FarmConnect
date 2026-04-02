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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🌾</div>
        <h1 style={styles.title}>FarmConnect Rwanda</h1>
        <p style={styles.subtitle}>Buyer Portal</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Phone Number</label>
          <input
            name="phone" type="tel" placeholder="e.g. 0789123456"
            value={form.phone} onChange={handleChange}
            style={styles.input} required
          />

          <label style={styles.label}>Password</label>
          <input
            name="password" type="password" placeholder="Your password"
            value={form.password} onChange={handleChange}
            style={styles.input} required
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          No account? <Link to="/register" style={{ color: '#1A56A0' }}>Register your business</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:     { minHeight: '100vh', background: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:     { background: 'white', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  logo:     { textAlign: 'center', fontSize: '48px', marginBottom: '8px' },
  title:    { textAlign: 'center', color: '#1A56A0', margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '24px' },
  error:    { background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  label:    { display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' },
  input:    { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' },
  button:   { width: '100%', padding: '14px', background: '#1A56A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  footer:   { textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' },
};