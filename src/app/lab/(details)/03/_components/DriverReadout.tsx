"use client";

import { useEffect, useRef } from "react";
import { getStats } from "../_utils/scrollDriver";

const DriverReadout = () => {
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
        <dt className="text-xs text-muted-foreground">驅動來源</dt>
        <dd
          ref={driverRef}
          className="text-muted-foreground data-[driver=fallback]:text-foreground data-[driver=r3f]:text-primary"
        >
          —
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">fallback 呼叫</dt>
        <dd ref={fallbackCountRef} className="tabular-nums">
          0
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">R3F 呼叫</dt>
        <dd ref={r3fCountRef} className="tabular-nums">
          0
        </dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs text-muted-foreground">同幀重複呼叫</dt>
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
