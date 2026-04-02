import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    phone: '', name: '', password: '',
    role: 'buyer', business_name: '', business_type: ''
  });
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
      const res = await authAPI.register(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '440px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <h1 style={{ color: '#1A56A0', marginBottom: '4px', fontSize: '22px' }}>Create Buyer Account</h1>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>Connect directly with Rwanda's farmers</p>

        {error && <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            ['phone', 'Phone Number', 'tel', '0789123456'],
            ['name', 'Full Name', 'text', 'Your name'],
            ['password', 'Password', 'password', 'At least 8 characters'],
            ['business_name', 'Business Name', 'text', 'e.g. Simba Supermarket'],
          ].map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>{label}</label>
              <input name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} required />
            </div>
          ))}

          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Business Type</label>
          <select name="business_type" value={form.business_type} onChange={handleChange}
            style={{ width: '100%', padding: '12px', marginBottom: '24px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px' }}>
            <option value="">Select type...</option>
            <option value="supermarket">Supermarket</option>
            <option value="restaurant">Restaurant</option>
            <option value="processor">Food Processor</option>
            <option value="hotel">Hotel</option>
            <option value="exporter">Exporter</option>
          </select>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#1A56A0' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}