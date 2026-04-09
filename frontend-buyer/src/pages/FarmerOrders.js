import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';

const STATUS_COLORS = {
  pending:   { bg: '#FFF8E1', color: '#F39C12' },
  accepted:  { bg: '#E8F5E9', color: '#1A7A3C' },
  rejected:  { bg: '#FFEBEE', color: '#C0392B' },
  paid:      { bg: '#E3F2FD', color: '#1A56A0' },
  completed: { bg: '#E8F5E9', color: '#1A7A3C' },
  disputed:  { bg: '#FFF3E0', color: '#E67E22' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    ordersAPI.getMine()
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const respond = async (order_id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this order?`)) return;
    try {
      await ordersAPI.respond({ order_id, action });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.');
    }
  };

  if (loading) return <p style={{ padding: '24px', color: '#888' }}>Loading orders...</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#1A7A3C', marginBottom: '20px' }}>📦 My Orders</h2>
      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders yet. Orders from buyers will appear here.</p>
      ) : (
        orders.map(o => {
          const s = STATUS_COLORS[o.status] || { bg: '#F5F5F5', color: '#666' };
          return (
            <div key={o.order_id} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#1A3A5C' }}>{o.crop_type}</h3>
                <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  {o.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px' }}>👤 Buyer: {o.other_party_name}</p>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px' }}>📦 Quantity: {o.quantity_kg} kg</p>
              <p style={{ color: '#1A7A3C', fontWeight: 'bold', margin: '0 0 16px' }}>💰 Total: {parseFloat(o.total_amount).toLocaleString()} RWF</p>
              {o.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => respond(o.order_id, 'accept')}
                    style={{ flex: 1, padding: '10px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✅ Accept Order
                  </button>
                  <button onClick={() => respond(o.order_id, 'reject')}
                    style={{ flex: 1, padding: '10px', background: '#FFEBEE', color: '#C0392B', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ❌ Reject Order
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}