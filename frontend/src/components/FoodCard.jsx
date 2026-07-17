import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { resolveImageUrl } from '../utils/image';

const FoodCard = ({ food }) => {
  const { user, cartItems, addToCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const quantity = cartItems[food._id] || 0;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    await addToCart(food._id, 1);
  };

  return (
    <article className="food-card">
      <div className="food-card__media">
        <img src={resolveImageUrl(food.image)} alt={food.name} loading="lazy" />
        <span className="badge">{food.category}</span>
      </div>
      <div className="food-card__body">
        <div>
          <h3>{food.name}</h3>
          <p>{food.description}</p>
        </div>
        <div className="food-card__footer">
          <strong>{formatCurrency(food.price)}</strong>
          <button type="button" className="btn btn-primary btn-block" onClick={handleAddToCart}>
            {user ? (quantity > 0 ? `Add more (${quantity})` : 'Add to Cart') : 'Login to Add'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FoodCard;
