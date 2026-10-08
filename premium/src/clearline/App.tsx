import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScrollToTop } from "../shared/ScrollToTop";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Portal } from "./pages/Portal";
import { Quote } from "./pages/Quote";
import { Services } from "./pages/Services";

const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const App = () => {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={location.pathname.split("/")[1] ?? ""} {...pageMotion}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:spaceId" element={<Services />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
};
