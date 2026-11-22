"use client";

import { useEffect, useRef } from "react";
import type { DriverReadoutLabels } from "../_content/types";
import { getStats } from "../_utils/scrollDriver";

/** Labels come in as props, so the notes in both locales stay out of the client bundle. */
const DriverReadout = ({ labels }: { labels: DriverReadoutLabels }) => {
  const driverRef = useRef<HTMLElement>(null);
  const fallbackCountRef = useRef<HTMLElement>(null);
  const r3fCountRef = useRef<HTMLElement>(null);
  const duplicatesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const { driver, counts, duplicates } = getStats();

      const driverElement = driverRef.current;
      if (driverElement) {
        driverElement.textContent = driver;
        driverElement.dataset.driver = driver;
      }

      const fallbackCountElement = fallbackCountRef.current;
      if (fallbackCountElement) {
        fallbackCountElement.textContent = counts.fallback.toString();
      }

      const r3fCountElement = r3fCountRef.current;
      if (r3fCountElement) {
        r3fCountElement.textContent = counts.r3f.toString();
      }

      const duplicatesElement = duplicatesRef.current;
      if (duplicatesElement) {
        duplicatesElement.textContent = duplicates.toString();
        duplicatesElement.dataset.alert = String(duplicates > 0);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-background/70 px-4 py-3 backdrop-blur-sm sm:grid-cols-4">
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">{labels.driver}</dt>
        <dd
          ref={driverRef}
          className="text-muted-foreground data-[driver=fallback]:text-foreground data-[driver=r3f]:text-primary"
        >
          —
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">{labels.fallback}</dt>
        <dd ref={fallbackCountRef} className="tabular-nums">
          0
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">{labels.r3f}</dt>
        <dd ref={r3fCountRef} className="tabular-nums">
          0
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">{labels.duplicates}</dt>
        <dd
          ref={duplicatesRef}
          className="tabular-nums data-[alert=true]:text-destructive"
        >
          0
        </dd>
      </div>
    </dl>
  );
};

export default DriverReadout;
