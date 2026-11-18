"use client";
import "lenis/dist/lenis.css";

import Lenis from "lenis";
import { useEffect } from "react";
import { useScrollStore } from "@/stores/scroll";

import { attachLenis, detachLenis } from "../_utils/scrollDriver";

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
