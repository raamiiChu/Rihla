"use client";

import { Canvas } from "@react-three/fiber";
import { MathUtils } from "three";

const Scene = () => {
  return (
    <Canvas>
      {/* Matches the page background (--color-night in globals.css). */}
      <color attach="background" args={["#07080d"]} />
      <directionalLight position={[-2, 0, 2]} />
      <ambientLight intensity={0.75} />

      <mesh position={[0, 0, 0]} rotation={[0, MathUtils.degToRad(45), 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Canvas>
  );
};

export default Scene;
