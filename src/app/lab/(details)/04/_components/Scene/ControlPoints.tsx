import { Html } from "@react-three/drei";
import type { CatmullRomCurve3 } from "three";
import { GOLD_COLOR } from "@/app/lab/const";

type ControlPointsProps = {
  curve: CatmullRomCurve3;
};

const ControlPoints = ({ curve }: ControlPointsProps) => {
  return curve.points.map(({ x, y, z }, index) => {
    return (
      <mesh key={`${x},${y},${z}`} position={[x, y, z]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={index % 2 === 0 ? GOLD_COLOR : "white"} />
        <Html center className="text-muted" pointerEvents="none">
          {index}
        </Html>
      </mesh>
    );
  });
};

export default ControlPoints;
