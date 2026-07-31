import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "smooth" animates over ~300-500ms — exactly the window where a page
    // like AuctionDetailPage is still showing its loading spinner (short)
    // before the real content (tall) renders. The animation finishes (or
    // is a no-op) against the short layout, and nothing re-triggers a
    // scroll once the real content lands, so the viewport ends up parked
    // mid-page instead of at the top. An instant jump has no such race.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}