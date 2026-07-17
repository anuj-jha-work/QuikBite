import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pinCode: ''
};

const Checkout = () => {
  const { user, getCartItems, getCartTotals, placeOrder } = useContext(StoreContext);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const totals = getCartTotals();
  const items = getCartItems();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const order = await placeOrder(form);
      navigate('/success', { state: { order } });
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container checkout-grid">
        <div className="form-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Checkout</span>
              <h1>Delivery details</h1>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            {Object.entries(initialForm).map(([field]) => (
              <label className="form-field" key={field}>
                <span>{field.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  className="input"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  disabled={!user}
                />
              </label>
            ))}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !user || items.length === 0}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        <aside className="summary-card">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="summary-item" key={item._id}>
              <span>{item.name} x {item.quantity}</span>
              <strong>{formatCurrency(item.lineTotal)}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <strong>{formatCurrency(totals.deliveryFee)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Grand total</span>
            <strong>{formatCurrency(totals.grandTotal)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
