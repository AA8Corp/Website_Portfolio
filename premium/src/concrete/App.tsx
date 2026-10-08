import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScrollToTop } from "../shared/ScrollToTop";
import { BagDrawer } from "./components/BagDrawer";
import { Footer } from "./components/Footer";
import { GritFilter } from "./components/GarmentArt";
import { Header } from "./components/Header";
import { Ticker } from "./components/Ticker";
import { Drop } from "./pages/Drop";
import { Home } from "./pages/Home";
import { Lookbook } from "./pages/Lookbook";
import { ProductPage } from "./pages/ProductPage";
import { Shop } from "./pages/Shop";

/** Hard cut with a slab: pages slam in from below instead of fading. */
const slam = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 420, damping: 32 } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.12 } },
};

export const App = () => {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <GritFilter />
      <a className="skip" href="#main">Skip to content</a>
      <Ticker />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={location.pathname} {...slam}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/drop" element={<Drop />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <BagDrawer />
    </>
  );
};
