import { Link } from "react-router-dom";
import logo from "../../assets/logos/boxbolt-light.webp";
import { PremiumBadge } from "../../shared/PremiumBadge";

export const Footer = () => (
  <footer className="footer">
    <div className="hazard" aria-hidden="true" />
    <div className="wrap footer-inner">
      <img src={logo} alt="BoxBolt" width={110} height={106} />
      <div>
        <p className="footer-big">Small truck. Big moves.</p>
        <p>Dispatch (555) 555-0199, 5 AM to 10 PM, 7 days</p>
        <p className="footer-links"><Link to="/planner">Load planner</Link><Link to="/track">Track a load</Link></p>
        <p className="footer-fine">Concept site for a fictional brand. Rates, bookings, and tracking are demos. <PremiumBadge className="premium-badge" /></p>
      </div>
    </div>
  </footer>
);
