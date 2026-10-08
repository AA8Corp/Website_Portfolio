import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets scroll on route change, but leaves in-page #anchors alone. */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
};
