"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollDriverHandoff } from "@/components";

import RailCamera from "./RailCamera";
import RailLine from "./RailLine";
import StationBackground from "./StationBackground";

const Scene = () => {
  return (
    <Canvas>
      <ScrollDriverHandoff />
      <StationBackground />

      <RailLine />
      <RailCamera />
    </Canvas>
  );
};

export default Scene;
