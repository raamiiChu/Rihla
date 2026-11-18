import { addEffect, Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { driveWithFallback, driveWithR3f } from "../_utils/scrollDriver";
import ProgressBox from "./ProgressBox";

const connectR3f = (canvas: HTMLCanvasElement) => {
  driveWithR3f(addEffect);

  const onLost = () => {
    driveWithFallback();
  };

  const onRestored = () => {
    driveWithR3f(addEffect);
  };

  const controller = new AbortController();
  const { signal } = controller;
  canvas.addEventListener("webglcontextlost", onLost, { signal });
  canvas.addEventListener("webglcontextrestored", onRestored, { signal });

  return () => {
    controller.abort();
    driveWithFallback();
  };
};

const Scene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disconnectRef = useRef<() => void>(null);
  const extRef = useRef<WEBGL_lose_context>(null);

  useEffect(() => {
    if (canvasRef.current) {
      disconnectRef.current = connectR3f(canvasRef.current);
      // driveWithR3f(addEffect);
    }

    return () => {
      disconnectRef.current?.();
      disconnectRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full">
      <Canvas
        onCreated={(state) => {
          canvasRef.current = state.gl.domElement;
          disconnectRef.current = connectR3f(canvasRef.current);
          // driveWithR3f(addEffect);

          extRef.current = state.gl
            .getContext()
            .getExtension("WEBGL_lose_context");
        }}
      >
        <color attach="background" args={["#07080d"]} />
        <directionalLight position={[-2, 0, 2]} />
        <ambientLight intensity={0.75} />

        <ProgressBox />
      </Canvas>

      <div className="absolute inset-e-4 top-4 flex gap-2">
        <Button
          onClick={() => {
            extRef.current?.loseContext();
          }}
        >
          Lose context
        </Button>
        <Button
          onClick={() => {
            extRef.current?.restoreContext();
          }}
        >
          Restore context
        </Button>
      </div>
    </div>
  );
};

export default Scene;
