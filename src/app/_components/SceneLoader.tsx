"use client";

import dynamic from "next/dynamic";
import SceneLoading from "./SceneLoading";

// `dynamic` with `ssr: false` may only be called in a client component, so
// this wrapper is what the Server Component page imports.
const Scene = dynamic(() => import("./Scene/Scene"), {
  ssr: false,
  loading: SceneLoading,
});

/**
 * The 3D layer: fixed to the viewport behind the page, so the DOM alone sets
 * how far the page scrolls. It takes no pointer events, so the text above
 * stays clickable; the scene has nothing to click yet.
 */
const SceneLoader = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Scene />
    </div>
  );
};

export default SceneLoader;
