"use client";

import dynamic from "next/dynamic";

import { SceneLoading } from "@/app/lab/_components";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: SceneLoading,
});

const SceneLoader = () => {
  return <Scene />;
};

export default SceneLoader;
