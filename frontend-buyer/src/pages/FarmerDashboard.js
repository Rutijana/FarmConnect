import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    listingsAPI.getMine()
      .then(res => setListings(res.data.listings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      setListings(listings.filter(l => l.listing_id !== id));
    } catch (err) {
      alert('Could not delete listing.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#1A7A3C', margin: '0 0 4px' }}>My Listings</h2>
          <p style={{ color: '#888', margin: 0 }}>Welcome back, {user?.name}</p>
        </div>
        <Link to="/create"
          style={{ padding: '12px 24px', background: '#1A7A3C', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          + New Listing
        </Link>
      </div>

      {loading ? <p style={{ color: '#888' }}>Loading your listings...</p> :
        listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌾</div>
            <h3 style={{ color: '#555' }}>No listings yet</h3>
            <p style={{ color: '#888' }}>Create your first listing to start selling!</p>
            <Link to="/create"
              style={{ display: 'inline-block', marginTop: '16px', padding: '12px 28px', background: '#1A7A3C', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Create First Listing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {listings.map(l => (
              <div key={l.listing_id} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#1A3A5C', fontSize: '18px' }}>{l.crop_type}</h3>
                  <span style={{ background: l.status === 'active' ? '#E8F5E9' : '#F5F5F5', color: l.status === 'active' ? '#1A7A3C' : '#888', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {l.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px' }}>📦 {l.quantity_kg} kg available</p>
                <p style={{ color: '#1A7A3C', fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px' }}>{l.price_per_kg} RWF/kg</p>
                {l.harvest_date && <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px' }}>🗓 {new Date(l.harvest_date).toLocaleDateString()}</p>}
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px' }}>👁 {l.views} views</p>
                <button onClick={() => deleteListing(l.listing_id)}
                  style={{ width: '100%', padding: '8px', background: '#FFF0F0', color: '#C0392B', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}