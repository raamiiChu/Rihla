"use client";

import dynamic from "next/dynamic";
import { SceneLoading } from "@/app/lab/_components";

// The import path must be a static string so the bundler can split it into
// its own chunk, which is why each unit keeps its own SceneLoader.
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: SceneLoading,
});

const SceneLoader = () => {
  return <Scene />;
};

export default SceneLoader;
