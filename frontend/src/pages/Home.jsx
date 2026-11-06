import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import FoodCard from '../components/FoodCard';

const categories = ['Pizza', 'Burger', 'Sandwich', 'Pasta', 'Rolls', 'Cake', 'Drinks', 'Salad', 'Dessert', 'Indian'];

const Home = () => {
  const { foods } = useContext(StoreContext);
  const popularFoods = foods.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Fast Delivery Made Fresh</span>
            <h1>Order crave-worthy meals without slowing down your day.</h1>
            <p>
              QuikBite connects you to hot, fresh, and well-crafted dishes with search, filters, smart cart totals,
              and a checkout flow designed for speed.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn btn-primary">
                Explore Menu
              </Link>
              <Link to="/orders" className="btn btn-ghost">
                View Orders
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>30 min</strong>
                <span>Average delivery</span>
              </div>
              <div>
                <strong>9</strong>
                <span>Food categories</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Responsive ordering</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-panel hero-panel--big">
              <span>Today's Favorite</span>
              <h2>BBQ Chicken Pizza</h2>
              <p>Smoke, spice, and melty cheese in a single order.</p>
            </div>
            <div className="hero-panel hero-panel--small">
              <span>Quick Reorder</span>
              <h3>One tap from cart to checkout</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Browse Categories</span>
              <h2>Popular Food Types</h2>
            </div>
            <Link to="/menu" className="text-link">
              See Full Menu
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category} to={`/menu?category=${category}`} className="category-chip">
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Popular Dishes</span>
              <h2>Top Picks Customers Order Most</h2>
            </div>
          </div>
          <div className="food-grid">
            {popularFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <span className="eyebrow">About QuikBite</span>
            <h2>A clean food delivery experience for phones, tablets, and desktops.</h2>
            <p>
              Search by name, filter by category, sort by price, manage your cart, and place orders with a secure
              JWT-powered backend and image uploads for food management.
            </p>
          </div>
          <div className="about-cards">
            <article className="info-card">
              <h3>Smart Search</h3>
              <p>Find any dish fast by typing the name directly into the menu search.</p>
            </article>
            <article className="info-card">
              <h3>Live Cart Totals</h3>
              <p>Keep track of subtotal, delivery fee, and final payment before checkout.</p>
            </article>
            <article className="info-card">
              <h3>Order Tracking</h3>
              <p>See processing, preparation, delivery, and cancellation states in your dashboard.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
