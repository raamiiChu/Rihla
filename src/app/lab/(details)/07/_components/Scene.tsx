import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { CANVAS_BG_COLOR } from "@/app/lab/const";
import { getNearestSampleIndex, resample } from "@/lib/morph/resample";
import { NEAREST_COLOR, SAMPLE_COLOR, VERTEX_COLOR } from "../_data/colors";
import { SOURCE } from "../_data/polyline";
import FitZoom from "./FitZoom";
import PointCloud from "./PointCloud";
import SourceLine from "./SourceLine";

type SceneProps = {
  count: number;
  closed: boolean;
};

const Scene = ({ count, closed }: SceneProps) => {
  // Only runs when a button changes the settings, never per frame.
  const { points, nearest } = useMemo(() => {
    const { points, sourceT } = resample(SOURCE, count, { closed });

    // Copy out the sample nearest each source vertex.
    const nearest = new Float32Array(sourceT.length * 3);
    sourceT.forEach((t, vertex) => {
      const index = getNearestSampleIndex(t, count, { closed });
      nearest.set(points.subarray(index * 3, index * 3 + 3), vertex * 3);
    });

    return { points, nearest };
  }, [count, closed]);

  return (
    // Orthographic: no perspective, so equal gaps look equal on screen.
    <Canvas orthographic camera={{ position: [0, 0, 10] }}>
      <color attach="background" args={[CANVAS_BG_COLOR]} />
      <FitZoom />

      {/* The buffers change length with the settings: remount rather than
          update in place, and R3F disposes the old geometry. */}
      <group key={`${closed}-${count}`}>
        <SourceLine positions={SOURCE} closed={closed} />
        <PointCloud
          positions={nearest}
          color={NEAREST_COLOR}
          size={8}
          renderOrder={1}
        />
        <PointCloud
          positions={SOURCE}
          color={VERTEX_COLOR}
          size={5}
          renderOrder={2}
        />
        <PointCloud
          positions={points}
          color={SAMPLE_COLOR}
          size={4}
          renderOrder={3}
        />
      </group>
    </Canvas>
  );
};

export default Scene;
