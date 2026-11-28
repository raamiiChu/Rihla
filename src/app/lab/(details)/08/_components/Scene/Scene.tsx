import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { CANVAS_BG_COLOR } from "@/app/lab/const";

import MorphLine from "./MorphLine";

type SceneProps = {
  /** How far round the loop to move the circle's start, from 0 to 1. */
  startOffset: number;
  /** Runs the circle the other way round. */
  reversed: boolean;
  /** Lines the circle up with the star before morphing. */
  aligned: boolean;
  /** The morph's progress, 0 to 1. Read it in useFrame; it never re-renders. */
  morphProgressRef: RefObject<number>;
};

const Scene = ({
  startOffset,
  reversed,
  aligned,
  morphProgressRef,
}: SceneProps) => {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 120 }}>
      <color attach="background" args={[CANVAS_BG_COLOR]} />

      <MorphLine
        startOffset={startOffset}
        reversed={reversed}
        aligned={aligned}
        morphProgressRef={morphProgressRef}
      />
    </Canvas>
  );
};

export default Scene;
