"use client";

import dynamic from "next/dynamic";
import { SceneLoading } from "@/app/lab/_components";

const SCENE_LOAD_DELAY_MS = 3000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const Scene = dynamic(
  async () => {
    await wait(SCENE_LOAD_DELAY_MS);
    return import("./Scene/Scene");
  },
  {
    ssr: false,
    loading: SceneLoading,
  },
);

const SceneLoader = () => {
  return <Scene />;
};

export default SceneLoader;
