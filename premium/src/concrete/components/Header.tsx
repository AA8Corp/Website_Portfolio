import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import mark from "../../assets/logos/cc-mark-light.webp";
import { useBag } from "../store";

export const Header = () => {
  const count = useBag((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const setOpen = useBag((s) => s.setOpen);
  return (
    <header className="head">
      <Link to="/" className="mark" aria-label="Concrete Culture, home"><img src={mark} alt="" width={84} height={42} /></Link>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/drop">Drop 07</NavLink>
        <NavLink to="/lookbook">Lookbook</NavLink>
      </nav>
      <button className="bag-btn" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Bag
        <motion.span key={count} className="bag-count" initial={{ scale: 1.6, backgroundColor: "#D7263D" }} animate={{ scale: 1, backgroundColor: "#111111" }} transition={{ duration: 0.4 }}>
          {count}
        </motion.span>
      </button>
    </header>
  );
};
