import { Html } from "@react-three/drei";
import { HTML_Z_INDEX_RANGE } from "../../_utils/html";
import { CURVE } from "../../_utils/rail";

const ControlPoints = () => {
  return CURVE.points.map(({ x, y, z }, index) => {
    return (
      <mesh key={`${x},${y},${z}`} position={[x, y, z]}>
        {/* <sphereGeometry args={[0.5, 16, 16]} /> */}
        {/* <meshBasicMaterial color="white" /> */}
        <Html
          center
          className="text-muted"
          pointerEvents="none"
          zIndexRange={HTML_Z_INDEX_RANGE}
        >
          {index}
        </Html>
      </mesh>
    );
  });
};

export default ControlPoints;
