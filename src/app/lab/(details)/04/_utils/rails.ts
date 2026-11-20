import { Box3, type CatmullRomCurve3, Vector3 } from "three";
import { buildRailLUT, type RailLUT } from "@/lib/camera/rail";
import { LOOP_CURVE, WAVE_CURVE } from "./curve";

// Few enough samples for the debug points and up lines to stay readable.
export const DEBUG_SAMPLES = 64;

export type Rail = {
  curve: CatmullRomCurve3;
  /** Drives the camera. */
  lut: RailLUT;
  /** A sparse LUT for the debug points and up lines. */
  debugLut: RailLUT;
  /** The centre of the control points' bounding box, for OrbitControls. */
  centre: Vector3;
};

const createRail = (curve: CatmullRomCurve3): Rail => ({
  curve,
  lut: buildRailLUT(curve),
  debugLut: buildRailLUT(curve, DEBUG_SAMPLES),
  centre: new Box3().setFromPoints(curve.points).getCenter(new Vector3()),
});

// Every rail is built once, up front, so switching between them in the scene
// does no work at all.
export const RAILS = {
  loop: createRail(LOOP_CURVE),
  wave: createRail(WAVE_CURVE),
} as const satisfies Record<string, Rail>;

export type RailName = keyof typeof RAILS;

export const DEFAULT_RAIL: RailName = "loop";
