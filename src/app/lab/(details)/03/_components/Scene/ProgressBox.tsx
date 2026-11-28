import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type Mesh } from "three";
import { useScrollStore } from "@/stores/scroll";

const Y_RANGE = [2, -2] as const;

const ProgressBox = () => {
  const boxRef = useRef<Mesh>(null);

  useFrame(() => {
    const box = boxRef.current;
    if (box) {
      const { progress } = useScrollStore.getState();
      box.position.y = MathUtils.lerp(Y_RANGE[0], Y_RANGE[1], progress);
      box.rotation.y = MathUtils.lerp(0, Math.PI * 2, progress);
    }
  });

  return (
    <mesh ref={boxRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};

export default ProgressBox;
