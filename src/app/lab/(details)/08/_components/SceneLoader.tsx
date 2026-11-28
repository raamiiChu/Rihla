"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";

import { SceneLoading } from "@/app/lab/_components";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: SceneLoading,
});

type SceneLoaderProps = {
  startOffset: number;
  reversed: boolean;
  aligned: boolean;
  morphProgressRef: RefObject<number>;
};

const SceneLoader = ({
  startOffset,
  reversed,
  aligned,
  morphProgressRef,
}: SceneLoaderProps) => {
  return (
    <Scene
      startOffset={startOffset}
      reversed={reversed}
      aligned={aligned}
      morphProgressRef={morphProgressRef}
    />
  );
};

export default SceneLoader;
