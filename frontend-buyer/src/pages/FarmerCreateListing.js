import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../utils/api';

const CROPS = ['Maize','Beans','Tomatoes','Potatoes','Sweet Potatoes','Cassava','Sorghum','Rice','Banana','Avocado','Onions','Wheat'];

export default function CreateListing() {
  const [form, setForm] = useState({
    crop_type: '', quantity_kg: '', price_per_kg: '', harvest_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await listingsAPI.create(form);
      alert('Listing created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: '#F0F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '480px', boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
        <h2 style={{ color: '#1A7A3C', marginBottom: '4px' }}>🌿 Create New Listing</h2>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>List your produce for buyers to find</p>

        {error && <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Crop Type</label>
          <select value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px' }} required>
            <option value="">Select a crop...</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Quantity (kg)</label>
          <input type="number" placeholder="e.g. 500" value={form.quantity_kg}
            onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} required />

          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Price per kg (RWF)</label>
          <input type="number" placeholder="e.g. 350" value={form.price_per_kg}
            onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} required />

          <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '600' }}>Harvest Date</label>
          <input type="date" value={form.harvest_date}
            onChange={e => setForm({ ...form, harvest_date: e.target.value })}
            style={{ width: '100%', padding: '12px', marginBottom: '24px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }} />

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}