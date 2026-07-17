import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const Login = () => {
  const { login, error, clearError } = useContext(AdminAuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
      navigate('/dashboard');
    } catch (requestError) {
      alert(requestError.response?.data?.message || requestError.message || 'Admin login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-login__card">
        <span className="admin-eyebrow">Admin access</span>
        <h1>Log in to QuikBite Admin</h1>
        <p>Only users flagged as admins can access the management console.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input className="admin-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            <span>Password</span>
            <input className="admin-input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" className="btn admin-btn-primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
          {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
        </form>
      </div>
    </section>
  );
};

export default Login;
