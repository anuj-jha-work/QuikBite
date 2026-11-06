import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import { resolveImageUrl } from '../utils/image';

const FoodCard = ({ food }) => {
  const { user, cartItems, addToCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const quantity = cartItems[food._id] || 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
  const [imageSrc, setImageSrc] = useState(resolveImageUrl(food.image));

  const handleImageError = () => {
    if (imageSrc !== fallbackImage) {
      setImageSrc(fallbackImage);
    }
  };

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
        <img 
          src={imageSrc} 
          alt={food.name} 
          onError={handleImageError} 
          loading="lazy" 
        />
        <span className="badge">{food.category}</span>
      </div>
      <div className="food-card__body">
        <div className="food-card__info">
          <h3 className="food-card__title">{food.name}</h3>
          <p className="food-card__description">{food.description}</p>
        </div>
        <div className="food-card__footer">
          <strong>{formatCurrency(food.price)}</strong>
          <button type="button" className="btn btn-primary btn-block" onClick={handleAddToCart}>
            {user ? (quantity > 0 ? `Add More (${quantity})` : 'Add to Cart') : 'Login to Add'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FoodCard;
