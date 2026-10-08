import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScrollToTop } from "../shared/ScrollToTop";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Planner } from "./pages/Planner";
import { Track } from "./pages/Track";

/** Page change reads like a roll-up door: a quick orange bar wipes across. */
const Wipe = () => (
  <motion.div
    className="route-wipe"
    aria-hidden="true"
    initial={{ scaleX: 1, originX: 0 }}
    animate={{ scaleX: 0, originX: 1, transition: { duration: 0.45, ease: [0.7, 0, 0.3, 1] } }}
  />
);

export const App = () => {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
          <Wipe />
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/track" element={<Track />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
};
