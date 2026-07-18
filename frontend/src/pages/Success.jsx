import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';

const Success = () => {
  const location = useLocation();
  const { getLastOrder } = useContext(StoreContext);
  const order = location.state?.order || getLastOrder();

  return (
    <section className="section">
      <div className="container">
        <div className="success-card">
          <span className="eyebrow">Order Confirmed</span>
          <h1>Thanks for ordering with QuikBite.</h1>
          <p>
            Your order is now being processed. You can view the latest status from your Orders dashboard at any time.
          </p>
          {order ? (
            <div className="success-details">
              <div className="success-detail-row">
                <span>Order ID</span>
                <strong>{order.orderId ? `QB-${order.orderId}` : `QB-${order._id.slice(-6).toUpperCase()}`}</strong>
              </div>
              <div className="success-detail-row">
                <span>Total Amount</span>
                <strong>{formatCurrency(order.amount)}</strong>
              </div>
              <div className="success-detail-row">
                <span>Status</span>
                <strong className={`status-text status-text--${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.status}
                </strong>
              </div>
            </div>
          ) : null}
          <div className="hero-actions">
            <Link to="/orders" className="btn btn-primary">
              View Orders
            </Link>
            <Link to="/menu" className="btn btn-ghost">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Success;
