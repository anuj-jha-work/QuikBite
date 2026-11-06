import { useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/dashboard" className="admin-brand">
          <span className="admin-brand__mark">Q</span>
          <span>
            QuikBite Admin
            <small>{user?.name || 'Management console'}</small>
          </span>
        </Link>
        <nav className="admin-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/foods" className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}>
            Food Management
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}>
            Order Management
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}>
            Users
          </NavLink>
        </nav>
        <button type="button" className="btn admin-btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Admin dashboard</span>
            <h1>Operate QuikBite at a glance</h1>
          </div>
          <div className="admin-topbar__badge">JWT protected</div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
