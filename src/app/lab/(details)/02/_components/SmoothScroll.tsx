"use client";
import "lenis/dist/lenis.css";

import Lenis from "lenis";
import { useEffect } from "react";
import { useScrollStore } from "@/stores/scroll";

const SmoothScroll = () => {
  useEffect(() => {
    console.log("created");
    const lenis = new Lenis({ autoRaf: false });

    const unsubscribe = lenis.on("scroll", ({ progress }) => {
      useScrollStore.getState().setProgress(progress);
    });

    let refId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      refId = requestAnimationFrame(loop);
    };
    refId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(refId);
      unsubscribe();
      lenis.destroy();
      console.log("destroyed");
    };
  }, []);

  return null;
};

export default SmoothScroll;
