import React, { useState, useEffect } from 'react';
import { listingsAPI, ordersAPI } from '../utils/api';

const CROPS = ['All','Maize','Beans','Tomatoes','Potatoes','Sweet Potatoes','Cassava','Rice','Banana','Avocado','Onions'];
const DISTRICTS = ['All','Gasabo','Kicukiro','Nyarugenge','Burera','Musanze','Rubavu','Nyamagabe','Huye','Rwamagana'];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop: 'All', district: 'All' });
  const [ordering, setOrdering] = useState(null);
  const [qtyInputs, setQtyInputs] = useState({});
  const [message, setMessage] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.crop !== 'All') params.crop = filters.crop;
      if (filters.district !== 'All') params.district = filters.district;
      const res = await listingsAPI.getAll(params);
      setListings(res.data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchListings(); }, [filters]);

  const placeOrder = async (listing) => {
    const qty = parseFloat(qtyInputs[listing.listing_id]);
    if (!qty || qty <= 0) return alert('Enter a valid quantity.');
    if (qty > listing.quantity_kg) return alert(`Max available: ${listing.quantity_kg} kg`);

    setOrdering(listing.listing_id);
    try {
      await ordersAPI.place({ listing_id: listing.listing_id, quantity_kg: qty });
      setMessage(`✅ Order placed for ${qty}kg of ${listing.crop_type}! Waiting for farmer to accept.`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not place order.');
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#1A56A0', marginBottom: '8px' }}>🛒 Browse Produce</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Fresh from Rwanda's farmers</p>

      {message && (
        <div style={{ background: '#E8F5E9', color: '#1A7A3C', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <select value={filters.crop} onChange={e => setFilters({ ...filters, crop: e.target.value })}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '15px' }}>
          {CROPS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '15px' }}>
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button onClick={fetchListings} style={{ padding: '10px 20px', background: '#1A56A0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          🔍 Search
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading produce...</p>
      ) : listings.length === 0 ? (
        <p style={{ color: '#888' }}>No listings found. Try different filters.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {listings.map(l => (
            <div key={l.listing_id} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#E8F5E9', padding: '30px 0', textAlign: 'center', fontSize: '52px' }}>
                🌾
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, color: '#1A3A5C', fontSize: '18px' }}>{l.crop_type}</h3>
                  {l.is_id_verified && <span style={{ background: '#E8F5E9', color: '#1A7A3C', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>✓ Verified</span>}
                </div>
                <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 12px' }}>
                  👨‍🌾 {l.farmer_name} · 📍 {l.district}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1A7A3C', fontSize: '20px' }}>{l.price_per_kg} RWF/kg</span>
                  <span style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>{l.quantity_kg} kg left</span>
                </div>
                {l.harvest_date && (
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 12px' }}>
                    🗓 Harvest: {new Date(l.harvest_date).toLocaleDateString()}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number" placeholder="Qty (kg)" min="1" max={l.quantity_kg}
                    value={qtyInputs[l.listing_id] || ''}
                    onChange={e => setQtyInputs({ ...qtyInputs, [l.listing_id]: e.target.value })}
                    style={{ flex: 1, padding: '10px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <button
                    onClick={() => placeOrder(l)}
                    disabled={ordering === l.listing_id}
                    style={{ padding: '10px 14px', background: '#1A56A0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                    {ordering === l.listing_id ? '...' : 'Order'}
                  </button>
                </div>
                {qtyInputs[l.listing_id] && (
                  <p style={{ fontSize: '13px', color: '#555', margin: '8px 0 0' }}>
                    Total: <strong>{(qtyInputs[l.listing_id] * l.price_per_kg).toLocaleString()} RWF</strong>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}