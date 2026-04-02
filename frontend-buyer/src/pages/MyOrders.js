import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';

const STATUS_COLORS = {
  pending:   { bg: '#FFF8E1', color: '#F39C12' },
  accepted:  { bg: '#E3F2FD', color: '#1A56A0' },
  paid:      { bg: '#E8F5E9', color: '#1A7A3C' },
  completed: { bg: '#E8F5E9', color: '#1A7A3C' },
  rejected:  { bg: '#FFEBEE', color: '#C0392B' },
  disputed:  { bg: '#FFF3E0', color: '#E67E22' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMine()
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (order_id) => {
    const provider = window.confirm('Pay with MTN MoMo? Click Cancel for Airtel Money.')
      ? 'mtn' : 'airtel';
    try {
      await ordersAPI.pay({ order_id, provider });
      alert('Payment locked in escrow! Farmer will now deliver.');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed.');
    }
  };

  const handleConfirmDelivery = async (order_id) => {
    if (!window.confirm('Confirm you received the goods? This will release payment to the farmer.')) return;
    try {
      const res = await ordersAPI.confirmDelivery({ order_id });
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.');
    }
  };

  if (loading) return <p style={{ padding: '24px', color: '#888' }}>Loading your orders...</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#1A56A0', marginBottom: '20px' }}>📦 My Orders</h2>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders yet. Go to the Marketplace to place your first order!</p>
      ) : (
        orders.map(o => {
          const s = STATUS_COLORS[o.status] || { bg: '#F5F5F5', color: '#666' };
          return (
            <div key={o.order_id} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#1A3A5C' }}>{o.crop_type}</h3>
                <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  {o.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px' }}>Farmer: {o.other_party_name}</p>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 4px' }}>Quantity: {o.quantity_kg} kg</p>
              <p style={{ color: '#1A7A3C', fontWeight: 'bold', margin: '0 0 16px' }}>Total: {parseFloat(o.total_amount).toLocaleString()} RWF</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                {o.status === 'accepted' && (
                  <button onClick={() => handlePayment(o.order_id)}
                    style={{ padding: '10px 20px', background: '#1A7A3C', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    💳 Pay Now
                  </button>
                )}
                {o.status === 'paid' && (
                  <button onClick={() => handleConfirmDelivery(o.order_id)}
                    style={{ padding: '10px 20px', background: '#1A56A0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✅ Confirm Delivery
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}