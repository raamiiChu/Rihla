import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { GOLD_COLOR } from "@/app/lab/const";
import { createCameraState, getCameraState } from "@/lib/camera/rail";
import { HTML_Z_INDEX_RANGE } from "../../_utils/html";
import { LUT, STATION_RAIL_POSITIONS } from "../../_utils/rail";
import { DEMO_STATION_WEIGHTS } from "../../_utils/timeline";

/** How far ahead of the resting camera each marker sits; within `far`. */
const MARKER_DISTANCE = 10;
const MARKER_RADIUS = 2;
const MARKER_TUBE = 0.08;

// The camera looks down its own -Z.
const LOCAL_FORWARD = new Vector3(0, 0, -1);

// Where the camera rests at each station, pushed forward along its view, and
// turned to face it. The rail never changes, so this runs once at load.
// The same placement will put each station's shape in front of the camera.
const MARKERS = STATION_RAIL_POSITIONS.map((u, i) => {
  const { position, quaternion } = getCameraState(u, LUT, createCameraState());
  const forward = LOCAL_FORWARD.clone().applyQuaternion(quaternion);
  return {
    id: DEMO_STATION_WEIGHTS[i].id,
    position: position.addScaledVector(forward, MARKER_DISTANCE),
    quaternion,
  };
});

const StationMarkers = () => {
  return MARKERS.map(({ id, position, quaternion }) => (
    <mesh key={id} position={position} quaternion={quaternion}>
      <torusGeometry args={[MARKER_RADIUS, MARKER_TUBE, 16, 64]} />
      <meshBasicMaterial color={GOLD_COLOR} />
      <Html
        center
        className="text-muted-foreground"
        pointerEvents="none"
        zIndexRange={HTML_Z_INDEX_RANGE}
      >
        station {id}
      </Html>
    </mesh>
  ));
};

export default StationMarkers;
