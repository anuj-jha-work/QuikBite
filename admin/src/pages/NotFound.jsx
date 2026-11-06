import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="admin-login">
      <div className="admin-login__card">
        <h1>Page not found</h1>
        <p>The admin route you requested does not exist.</p>
        <Link to="/dashboard" className="btn admin-btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
