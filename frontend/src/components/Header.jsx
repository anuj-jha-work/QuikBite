import { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const Header = () => {
  const { user, cartItems, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartCount = Object.values(cartItems).reduce((sum, quantity) => sum + Number(quantity || 0), 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Q</span>
          <span>
            QuikBite
            <small>Fresh food, fast delivery</small>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Menu
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Cart
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Orders
          </NavLink>
        </nav>

        <div className="header-actions">
          <Link to="/cart" className="cart-pill">
            Cart <span>{cartCount}</span>
          </Link>
          {user ? (
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
