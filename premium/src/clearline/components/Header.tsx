import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logos/clearline.webp";

const NAV = [
  { to: "/services/office", label: "What we clean" },
  { to: "/quote", label: "Quote builder" },
  { to: "/portal", label: "Client portal" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap header-inner">
        <Link to="/" className="brand" aria-label="Clearline Commercial Cleaning, home">
          <img src={logo} alt="Clearline" width={140} height={45} />
        </Link>
        <button className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            {open ? <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
          </svg>
        </button>
        <nav id="site-nav" className={`site-nav${open ? " is-open" : ""}`} aria-label="Primary">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive || (n.to.startsWith("/services") && pathname.startsWith("/services")) ? "is-active" : undefined)}>
              {n.label}
            </NavLink>
          ))}
          <Link to="/quote" className="btn btn-primary btn-sm">Get a fixed price</Link>
        </nav>
      </div>
    </header>
  );
};
