import { extend } from "@react-three/fiber";
import { useMemo } from "react";
import { type CatmullRomCurve3, Line } from "three";

extend({ ThreeLine: Line });

type RailLineProps = {
  curve: CatmullRomCurve3;
};

const RailLine = ({ curve }: RailLineProps) => {
  const positions = useMemo(() => {
    const points = curve
      .getPoints(500)
      .flatMap((point) => [point.x, point.y, point.z]);

    return new Float32Array(points);
  }, [curve]);

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
