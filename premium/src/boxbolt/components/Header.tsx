import { Link, NavLink } from "react-router-dom";
import mark from "../../assets/logos/boxbolt-mark-light.webp";

export const Header = () => (
  <header className="topbar">
    <div className="wrap topbar-inner">
      <Link to="/" className="brand" aria-label="BoxBolt Logistics, home">
        <img src={mark} alt="" width={48} height={38} />
        <span>BoxBolt<small>Logistics</small></span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/planner">Load planner</NavLink>
        <NavLink to="/track">Track</NavLink>
      </nav>
      <Link to="/planner" className="btn btn-orange">Get a rate</Link>
    </div>
  </header>
);
