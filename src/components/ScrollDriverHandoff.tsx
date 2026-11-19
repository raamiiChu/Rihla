"use client";

import { addEffect, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { driveWithFallback, driveWithR3f } from "@/lib/scroll/driver";

const connectR3f = (canvas: HTMLCanvasElement) => {
  driveWithR3f(addEffect);

  const onLost = () => {
    driveWithFallback();
  };

  const onRestored = () => {
    driveWithR3f(addEffect);
  };

  const controller = new AbortController();
  const { signal } = controller;
  canvas.addEventListener("webglcontextlost", onLost, { signal });
  canvas.addEventListener("webglcontextrestored", onRestored, { signal });

  return () => {
    controller.abort();
    driveWithFallback();
  };
};

const ScrollDriverHandoff = () => {
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const disconnect = connectR3f(canvas);

    return () => {
      disconnect();
    };
  }, [canvas]);

  return null;
};

export default ScrollDriverHandoff;
