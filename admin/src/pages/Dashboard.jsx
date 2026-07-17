import { useEffect, useState } from 'react';
import api from '../api/client';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/currency';

const defaultStats = { totalOrders: 0, totalUsers: 0, totalFoods: 0, totalRevenue: 0 };

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/order/list')
      ]);

      setStats(statsResponse.data.stats || defaultStats);
      setRecentOrders((ordersResponse.data.orders || []).slice(0, 5));
    };

    loadDashboard().catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <div className="admin-stack">
      <section className="admin-stat-grid">
        <StatCard label="Total Orders" value={stats.totalOrders} hint="All orders in the system" />
        <StatCard label="Total Users" value={stats.totalUsers} hint="Registered customer accounts" />
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} hint="Excluding cancelled orders" />
        <StatCard label="Total Foods" value={stats.totalFoods} hint="Active menu items" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2>Recent Orders</h2>
          <span>Latest five records</span>
        </div>
        <div className="admin-table">
          <div className="admin-table__row admin-table__head">
            <span>Order ID</span>
            <span>User</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          {recentOrders.map((order) => (
            <div className="admin-table__row" key={order._id}>
              <span>{order._id.slice(-8)}</span>
              <span>{order.userId?.name || 'Guest'}</span>
              <span>{order.status}</span>
              <span>{formatCurrency(order.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
