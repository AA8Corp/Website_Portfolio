import { Link } from "react-router-dom";
import logo from "../../assets/logos/clearline-light.webp";
import { PremiumBadge } from "../../shared/PremiumBadge";

export const Footer = () => (
  <footer className="site-footer">
    <div className="wrap footer-grid">
      <div>
        <img src={logo} alt="Clearline" width={160} height={51} />
        <p>Spotless spaces. Serious business.</p>
      </div>
      <nav aria-label="Footer">
        <h2>Explore</h2>
        <Link to="/services/office">Offices</Link>
        <Link to="/services/clinic">Medical clinics</Link>
        <Link to="/services/retail">Retail</Link>
        <Link to="/portal">Client portal</Link>
      </nav>
      <div>
        <h2>Contact</h2>
        <p>(555) 555-0142<br />hello@clearline.example</p>
        <p>Crews out 7 nights a week</p>
      </div>
    </div>
    <div className="wrap footer-base">
      <p>Concept site for a fictional brand. Forms and portal data are demos.</p>
      <PremiumBadge className="premium-badge" />
    </div>
  </footer>
);
