import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
