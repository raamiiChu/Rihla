import { PerspectiveCamera, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type * as THREE from "three";
import { CameraHelper } from "three";
import { useScrollStore } from "@/stores/scroll";
import {
  createCameraState,
  getCameraState,
  type RailLUT,
} from "../_utils/rail";

const cameraState = createCameraState();

type RailCameraProps = {
  active: boolean;
  /** Read every frame, so switching rails takes effect on the next frame. */
  lut: RailLUT;
};

const FAR = { orbit: 7, rail: 70 };

const RailCamera = ({ active, lut }: RailCameraProps) => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // useHelper's type demands a non-null ref, but it checks `current` before use.
  useHelper(
    active ? null : (cameraRef as RefObject<THREE.PerspectiveCamera>),
    CameraHelper,
  );

  useFrame(() => {
    const { progress } = useScrollStore.getState();
    const camera = cameraRef.current;

    if (!camera) {
      return;
    }

    getCameraState(progress, lut, cameraState);

    camera.position.copy(cameraState.position);
    camera.quaternion.copy(cameraState.quaternion);
  });

  return (
    <PerspectiveCamera
      makeDefault={active}
      ref={cameraRef}
      far={FAR[active ? "rail" : "orbit"]}
    />
  );
};

export default RailCamera;
