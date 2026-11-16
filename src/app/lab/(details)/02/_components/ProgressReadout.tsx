"use client";

import { useEffect, useRef } from "react";
import { useScrollStore } from "@/stores/scroll";

const ProgressReadout = () => {
  const progressRef = useRef<HTMLSpanElement>(null);

  // Do not subscribe with a selector here: progress changes every frame,
  // so the component would re-render on every frame while scrolling.
  // const progress = useScrollStore((state) => state.progress);

  console.log("ProgressReadout rendered");

  useEffect(() => {
    let refId = 0;

    const loop = () => {
      const { progress } = useScrollStore.getState();

      if (progressRef.current) {
        progressRef.current.textContent = progress.toFixed(4);
      }

      refId = requestAnimationFrame(loop);
    };
    refId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(refId);
    };
  }, []);

  return (
    <div>
      <span>Progress: </span>
      <span ref={progressRef}>0.0000</span>
    </div>
  );
};

export default ProgressReadout;
