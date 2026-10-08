import { Link } from "react-router-dom";
import logo from "../../assets/logos/concrete-culture-light.webp";
import { PremiumBadge } from "../../shared/PremiumBadge";

export const Footer = () => (
  <footer className="foot">
    <img src={logo} alt="Concrete Culture" width={240} height={160} />
    <p className="foot-tag">Built from the block.</p>
    <nav className="foot-nav" aria-label="Footer"><Link to="/shop">Shop</Link><Link to="/drop">Drop 07</Link></nav>
    <p className="foot-fine">Concept site for a fictional brand. Bag and checkout are demos. <PremiumBadge className="premium-badge" /></p>
  </footer>
);
