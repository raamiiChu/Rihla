import { extend } from "@react-three/fiber";
import { useMemo } from "react";
import { Line } from "three";

import { CURVE } from "../../_utils/rail";

extend({ ThreeLine: Line });

const RailLine = () => {
  const positions = useMemo(() => {
    const points = CURVE.getPoints(500).flatMap((point) => [
      point.x,
      point.y,
      point.z,
    ]);

    return new Float32Array(points);
  }, []);

  return (
    <threeLine>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="white" />
    </threeLine>
  );
};

export default RailLine;
