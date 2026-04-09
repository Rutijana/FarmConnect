import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({
    phone: '', name: '', password: '',
    business_name: '', business_type: '',
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
      const res = await authAPI.register({ ...form, role });
      login(res.data.user, res.data.token);
      // Redirect based on role
      navigate(res.data.user.role === 'farmer' ? '/farmer/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '480px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>🌾</div>
        <h1 style={{ textAlign: 'center', color: '#1A56A0', margin: '0 0 4px', fontSize: '22px' }}>Create Account</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px', fontSize: '14px' }}>Join FarmConnect Rwanda</p>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button type="button" onClick={() => setRole('buyer')}
            style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid', borderColor: role === 'buyer' ? '#1A56A0' : '#DDD', background: role === 'buyer' ? '#EEF2F7' : 'white', color: role === 'buyer' ? '#1A56A0' : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            🛒 I am a Buyer
          </button>
          <button type="button" onClick={() => setRole('farmer')}
            style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid', borderColor: role === 'farmer' ? '#1A7A3C' : '#DDD', background: role === 'farmer' ? '#F0F7F2' : 'white', color: role === 'farmer' ? '#1A7A3C' : '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            🌱 I am a Farmer
          </button>
        </div>

        {error && <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Common fields */}
          {[
            ['phone',    'Phone Number', 'tel',      '0789123456'],
            ['name',     'Full Name',    'text',     'Your full name'],
            ['password', 'Password',     'password', 'At least 8 characters'],
          ].map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>{label}</label>
              <input name={name} type={type} placeholder={placeholder} value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                required />
            </div>
          ))}

          {/* Buyer-specific fields */}
          {role === 'buyer' && (
            <>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Business Name</label>
              <input type="text" placeholder="e.g. Simba Supermarket" value={form.business_name}
                onChange={e => setForm({ ...form, business_name: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                required />

              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Business Type</label>
              <select value={form.business_type} onChange={e => setForm({ ...form, business_type: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px' }}>
                <option value="">Select type...</option>
                <option value="supermarket">Supermarket</option>
                <option value="restaurant">Restaurant</option>
                <option value="processor">Food Processor</option>
                <option value="hotel">Hotel</option>
                <option value="exporter">Exporter</option>
              </select>
            </>
          )}

          {/* Farmer-specific fields */}
          {role === 'farmer' && (
            <>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>District</label>
              <input type="text" placeholder="e.g. Musanze" value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
                required />

              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Sector</label>
              <input type="text" placeholder="e.g. Kinigi" value={form.sector}
                onChange={e => setForm({ ...form, sector: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} />

              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Farm Size (hectares)</label>
              <input type="number" placeholder="e.g. 0.5" value={form.farm_size}
                onChange={e => setForm({ ...form, farm_size: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} />
            </>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: role === 'farmer' ? '#1A7A3C' : '#1A56A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Creating account...' : `Create ${role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#1A56A0' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}