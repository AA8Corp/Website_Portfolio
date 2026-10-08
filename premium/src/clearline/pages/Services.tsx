import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useParams } from "react-router-dom";
import { SPACES, spaceById } from "../data";
import { useQuote } from "../store";

export const Services = () => {
  const { spaceId } = useParams();
  const space = spaceById(spaceId) ?? SPACES[0]!;
  const setSpace = useQuote((s) => s.setSpace);
  const goTo = useQuote((s) => s.goTo);

  return (
    <section className="section services">
      <div className="wrap">
        <div className="section-head">
          <h1>What we clean</h1>
          <p>Every plan is a fixed list of tasks at a fixed frequency. Pick your space to see the standard scope.</p>
        </div>

        <nav className="space-tabs" aria-label="Space type">
          {SPACES.map((s) => (
            <NavLink key={s.id} to={`/services/${s.id}`} className={() => (s.id === space.id ? "is-active" : undefined)} aria-current={s.id === space.id ? "page" : undefined}>
              {s.id === space.id && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span className="tab-label">{s.name}</span>
            </NavLink>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={space.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <p className="space-blurb">{space.blurb}</p>
            <div className="services-grid">
              <div className="cadence">
                {space.cadence.map((c) => (
                  <div key={c.title}>
                    <h2>{c.title}</h2>
                    <ul>{c.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                ))}
              </div>
              <aside className="report-card" aria-label="Sample sign-off report">
                <p className="report-label">Sample sign-off</p>
                <p className="report-site">{space.sampleReport.site}</p>
                <ul>
                  {space.sampleReport.items.map((item) => <li key={item}><span className="tick" aria-hidden="true" />{item}</li>)}
                </ul>
                <Link to="/quote" className="btn btn-primary btn-block" onClick={() => { setSpace(space.id); goTo(1); }}>
                  Price a {space.short.toLowerCase()} plan
                </Link>
              </aside>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
