"use client";

import dynamic from "next/dynamic";

import { SceneLoading } from "@/app/lab/_components";

const Scene = dynamic(() => import("./Scene/Scene"), {
  ssr: false,
  loading: SceneLoading,
});

type SceneLoaderProps = {
  count: number;
  closed: boolean;
};

const SceneLoader = ({ count, closed }: SceneLoaderProps) => {
  return <Scene count={count} closed={closed} />;
};

export default SceneLoader;
