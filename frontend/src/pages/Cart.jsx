import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { resolveImageUrl } from '../utils/image';

const Cart = () => {
  const { user, getCartItems, getCartTotals, updateCart, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartItems = getCartItems();
  const totals = getCartTotals();

  const handleQuantityChange = async (foodId, quantity) => {
    if (quantity < 1) {
      await removeFromCart(foodId, 1);
      return;
    }

    await updateCart(foodId, quantity);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your Cart</span>
            <h1>Review items before checkout.</h1>
          </div>
          <Link to="/menu" className="text-link">
            Continue Shopping
          </Link>
        </div>

        {!user ? <div className="empty-state">Please log in to use the cart.</div> : null}

        {user && cartItems.length === 0 ? <div className="empty-state">Your cart is empty. Add some food first.</div> : null}

        {cartItems.length > 0 ? (
          <div className="cart-layout">
            <div className="cart-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item._id}>
                  <img 
                    src={resolveImageUrl(item.image)} 
                    alt={item.name} 
                    onError={(event) => {
                      event.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="cart-item__body">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.category}</p>
                    </div>
                    <div className="cart-item__meta">
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                      <span>{formatCurrency(item.price)} each</span>
                    </div>
                  </div>
                  <div className="qty-control">
                    <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => removeFromCart(item._id, item.quantity)}>
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <aside className="summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(totals.subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <strong>{formatCurrency(totals.deliveryFee)}</strong>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total Amount</span>
                <strong>{formatCurrency(totals.grandTotal)}</strong>
              </div>
              <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Cart;
