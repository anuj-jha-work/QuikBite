import { useEffect, useState } from 'react';
import api from '../api/client';
import { formatCurrency } from '../utils/currency';

const statuses = ['Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [savingId, setSavingId] = useState('');

  const loadOrders = async () => {
    const response = await api.get('/api/order/list');
    setOrders(response.data.orders || []);
  };

  useEffect(() => {
    loadOrders().catch((error) => {
      console.error(error);
    });
  }, []);

  const updateStatus = async (orderId, status) => {
    setSavingId(orderId);
    try {
      await api.post('/api/order/status', { orderId, status });
      await loadOrders();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to update order');
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <h2>Order Management</h2>
        <span>{orders.length} orders</span>
      </div>
      <div className="admin-table admin-table--orders">
        <div className="admin-table__row admin-table__head">
          <span>Order</span>
          <span>User</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Update</span>
        </div>
        {orders.map((order) => (
          <div className="admin-table__row admin-table__row--orders" key={order._id}>
            <span>{order._id.slice(-8)}</span>
            <span>{order.userId?.name || order.address?.name || 'Unknown'}</span>
            <span>{formatCurrency(order.amount)}</span>
            <span>{order.status}</span>
            <div className="admin-inline-actions">
              <select className="admin-input" value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} disabled={savingId === order._id}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Orders;
