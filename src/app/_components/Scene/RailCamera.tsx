import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { RAIL_LUT, STATION_RAIL_POSITIONS } from "@/data/rail";
import { STATION_RANGES } from "@/data/timeline";
import { getRailProgress } from "@/lib/camera/pacing";
import { createCameraState, getCameraState } from "@/lib/camera/rail";
import { useScrollStore } from "@/stores/scroll";

const cameraState = createCameraState();

const RailCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useFrame(() => {
    const { progress } = useScrollStore.getState();
    const camera = cameraRef.current;

    if (!camera) {
      return;
    }

    const railProgress = getRailProgress(
      progress,
      STATION_RANGES,
      STATION_RAIL_POSITIONS,
    );
    getCameraState(railProgress, RAIL_LUT, cameraState);

    camera.position.copy(cameraState.position);
    camera.quaternion.copy(cameraState.quaternion);
  });

  return <PerspectiveCamera makeDefault ref={cameraRef} />;
};

export default RailCamera;
