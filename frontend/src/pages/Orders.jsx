import { useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';

const currentStatuses = ['Processing', 'Preparing', 'Out for Delivery'];

const Orders = () => {
  const { orders, loadOrders, user } = useContext(StoreContext);

  useEffect(() => {
    if (user) {
      loadOrders().catch((error) => {
        console.error(error);
      });
    }
  }, [user]);

  const currentOrders = orders.filter((order) => currentStatuses.includes(order.status));
  const previousOrders = orders.filter((order) => !currentStatuses.includes(order.status));

  const renderOrder = (order) => (
    <article className="order-card" key={order._id}>
      <div className="order-card__top">
        <div>
          <span className="eyebrow">Order</span>
          <h3>{order.orderId ? `QB-${order.orderId}` : `QB-${order._id.slice(-6).toUpperCase()}`}</h3>
        </div>
        <span className={`status-pill status-pill--${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
      </div>
      <div className="order-card__meta">
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        <strong>{formatCurrency(order.amount)}</strong>
      </div>
      <ul className="order-items">
        {order.items.map((item) => (
          <li key={`${order._id}-${item.foodId}`}>
            {item.name} x {item.quantity}
          </li>
        ))}
      </ul>
      <p className="order-address">
        {order.address?.address}, {order.address?.city}, {order.address?.state} - {order.address?.pinCode}
      </p>
    </article>
  );

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">User Dashboard</span>
            <h1>Your Orders</h1>
          </div>
        </div>

        {!user ? <div className="empty-state">Log in to view your order history.</div> : null}

        {user ? (
          <>
            <div className="dashboard-section">
              <h2>Current Orders</h2>
              <div className="stack-grid">
                {currentOrders.length > 0 ? currentOrders.map(renderOrder) : <div className="empty-state">No active orders right now.</div>}
              </div>
            </div>
            <div className="dashboard-section">
              <h2>Previous Orders</h2>
              <div className="stack-grid">
                {previousOrders.length > 0 ? previousOrders.map(renderOrder) : <div className="empty-state">No previous orders yet.</div>}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default Orders;
