"use client";
import "lenis/dist/lenis.css";

import Lenis from "lenis";
import { useEffect } from "react";
import { attachLenis, detachLenis } from "@/lib/scroll/driver";
import { useScrollStore } from "@/stores/scroll";

const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false });
    useScrollStore.getState().setProgress(lenis.progress);

    const unsubscribe = lenis.on("scroll", ({ progress }) => {
      useScrollStore.getState().setProgress(progress);
    });

    attachLenis(lenis);

    return () => {
      detachLenis();
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
