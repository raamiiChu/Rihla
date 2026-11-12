"use client";

import { Canvas } from "@react-three/fiber";
import { MathUtils } from "three";

const Scene = () => {
  return (
    <Canvas>
      {/* Matches the page background (neutral-950). */}
      <color attach="background" args={["#0a0a0a"]} />
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
