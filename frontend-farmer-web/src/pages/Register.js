import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    phone: '', name: '', password: '',
    district: '', sector: '', farm_size: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.register({ ...form, role: 'farmer' });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['phone',     'Phone Number',         'tel',      '0789123456'],
    ['name',      'Full Name',            'text',     'Your full name'],
    ['password',  'Password',             'password', 'At least 8 characters'],
    ['district',  'District',             'text',     'e.g. Musanze'],
    ['sector',    'Sector',               'text',     'e.g. Kinigi'],
    ['farm_size', 'Farm Size (hectares)', 'number',   'e.g. 0.5'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '440px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>🌾</div>
        <h1 style={{ textAlign: 'center', color: '#1A7A3C', margin: '0 0 4px', fontSize: '22px' }}>Register as Farmer</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px', fontSize: '14px' }}>Join FarmConnect Rwanda</p>

        {error && <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>{label}</label>
              <input name={name} type={type} placeholder={placeholder} value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                required={['phone','name','password','district'].includes(name)} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Farmer Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#1A7A3C' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}