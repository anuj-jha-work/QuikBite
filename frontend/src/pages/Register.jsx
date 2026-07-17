import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const Register = () => {
  const { register } = useContext(StoreContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMessage('');
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/menu');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section auth-shell">
      <div className="container auth-card">
        <div>
          <span className="eyebrow">Create your account</span>
          <h1>Register to start ordering fast.</h1>
          <p>One account unlocks the cart, checkout, and your personal order dashboard.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Name</span>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required minLength="8" />
          </label>
          <label className="form-field">
            <span>Confirm Password</span>
            <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength="8" />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
          {message ? <div className="form-message form-message--error">{message}</div> : null}
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;
