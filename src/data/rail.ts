import { CatmullRomCurve3, Vector3 } from "three";
import { getStationRailPositions } from "@/lib/camera/pacing";
import { buildRailLUT } from "@/lib/camera/rail";
import { STATION_WEIGHTS, type StationId } from "./timeline";

/**
 * Degrees to world units. Longitude runs along +x (east) and latitude along
 * −z (north), so the rail heads the right way; heights are free, chosen for
 * the look. Direction right, proportions not.
 */
const UNITS_PER_DEGREE = 1.5;

const fromLonLat = (lon: number, lat: number, height: number) =>
  new Vector3(lon * UNITS_PER_DEGREE, height, -lat * UNITS_PER_DEGREE);

/**
 * The camera rail: an invisible curve that only steers the camera. It heads
 * east to Quanzhou, then swings back west-south-west to Timbuktu and north to
 * Fez. Stations sit on control points; the rest only shape the rail. A first
 * draft, to be tuned once there is something to look at.
 */
export const RAIL_CURVE = new CatmullRomCurve3([
  fromLonLat(-5.83, 35.76, 30), // 0 Tangier
  fromLonLat(31.2, 30.0, 20), // 1 by Cairo
  fromLonLat(39.83, 21.42, 15), // 2 Mecca
  fromLonLat(50.0, 37.0, 25), // 3 across Persia
  fromLonLat(66.96, 39.65, 35), // 4 Samarkand
  fromLonLat(77.21, 28.61, 20), // 5 Delhi
  fromLonLat(75.8, 11.3, 12), // 6 by Calicut
  fromLonLat(73.51, 4.18, 5), // 7 Maldives
  fromLonLat(97.0, 5.0, 10), // 8 by Sumatra
  fromLonLat(118.68, 24.87, 25), // 9 Quanzhou

  // The long way home, lifted well above the outward legs it passes over.
  fromLonLat(60.0, 27.0, 55), // 10
  fromLonLat(20.0, 13.0, 40), // 11
  fromLonLat(-3.0, 16.77, 10), // 12 Timbuktu

  // Ends almost above Tangier; kept higher so the two ends do not meet.
  fromLonLat(-5.01, 34.02, 45), // 13 Fez
]);

// Finer than the default 200, for an accurate arc length.
RAIL_CURVE.arcLengthDivisions = 2000;

/**
 * Which control point each station sits on. Keyed by id, so a station added
 * to the timeline fails to compile until it has one; the order still comes
 * from the timeline.
 */
const STATION_CONTROL_POINTS: Record<StationId, number> = {
  tangier: 0,
  mecca: 2,
  samarkand: 4,
  delhi: 5,
  maldives: 7,
  quanzhou: 9,
  timbuktu: 12,
  fez: 13,
};

/** Positions, tangents and parallel-transported ups, built once at load. */
export const RAIL_LUT = buildRailLUT(RAIL_CURVE);

/** Each station's `u` on the rail, in timeline order. */
export const STATION_RAIL_POSITIONS = getStationRailPositions(
  RAIL_CURVE,
  STATION_WEIGHTS.map(({ id }) => STATION_CONTROL_POINTS[id]),
);
