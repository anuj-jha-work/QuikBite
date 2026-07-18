import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-section">
          <h3>QuikBite</h3>
          <p className="footer-desc">
            Modern food delivery for busy days, late nights, and everything between. Order crave-worthy meals right to your doorstep.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)">X</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>
            <strong>Address</strong><br />
            Rajouri Garden<br />
            New Delhi - 110027
          </p>
          <p>
            <strong>Phone</strong><br />
            +91 98765 43210
          </p>
          <p>
            <strong>Email</strong><br />
            hello@quikbite.in
          </p>
        </div>

        <div className="footer-section">
          <h4>Opening Hours</h4>
          <p>
            10:00 AM – 11:00 PM<br />
            Every day of the week
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <hr className="footer-divider" />
        <p className="copyright">&copy; {new Date().getFullYear()} QuikBite. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
