// useCountdown.js is a hook that ticks every second and outputs "01h 47m 03s" for live auctions or "2d 14h 30m" for upcoming ones.

// src/hooks/useCountdown.js
import { useState, useEffect } from "react";

/**
 * Returns a live countdown string ("2h 47m 03s") until `targetISOString`.
 * Returns null if the target is in the past or not provided.
 */
export default function useCountdown(targetISOString) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!targetISOString) return;

    const tick = () => {
      const diff = new Date(targetISOString) - Date.now();
      if (diff <= 0) {
        setDisplay("Ended");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        setDisplay(`${days}d ${hours}h ${String(minutes).padStart(2, "0")}m`);
      } else {
        setDisplay(
          `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
        );
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetISOString]);

  return display;
}