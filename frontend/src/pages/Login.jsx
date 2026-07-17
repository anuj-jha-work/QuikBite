import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const Login = () => {
  const { login, user, error, clearError } = useContext(StoreContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    clearError();
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/menu', { replace: true });
    } catch (requestError) {
      alert(requestError.response?.data?.message || requestError.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-shell">
      <div className="container auth-card">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>Log in to manage your cart and orders.</h1>
          <p>Use the same account for customer ordering and order tracking.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
          {error ? <div className="form-message form-message--error">{error}</div> : null}
          <p className="auth-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
