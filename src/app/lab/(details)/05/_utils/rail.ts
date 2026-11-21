import { CatmullRomCurve3, Vector3 } from "three";
import { getStationRailPositions } from "@/lib/camera/pacing";
import { buildRailLUT } from "@/lib/camera/rail";
import { DEMO_STATION_WEIGHTS, type DemoStationId } from "./timeline";

export const CURVE = new CatmullRomCurve3([
  new Vector3(24, 44, 10),
  new Vector3(40, 20, -50),
  new Vector3(20, 30, -70),
  new Vector3(10, 50, -150),
  new Vector3(30, 30, -220),
]);

// Finer than the default 200, for an accurate arc length.
CURVE.arcLengthDivisions = 1000;

// Which control point each station sits on; the others only shape the rail.
// Keyed by id, so a station added to the demo timeline fails to compile until
// it has a control point, and the order always follows the timeline.
const STATION_POINTS: Record<DemoStationId, number> = {
  tangier: 0,
  mecca: 2,
  samarkand: 4,
};

export const LUT = buildRailLUT(CURVE);

/** Each station's `u` on the rail, in timeline order. */
export const STATION_RAIL_POSITIONS = getStationRailPositions(
  CURVE,
  DEMO_STATION_WEIGHTS.map(({ id }) => STATION_POINTS[id]),
);
