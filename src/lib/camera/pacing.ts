import { type CatmullRomCurve3, MathUtils } from "three";
import { getStationIndex, type StationRange } from "@/lib/timeline/stations";

/**
 * Each station's position on the rail as an arc-length fraction `u`, ready
 * for `getCameraState`. Stations sit on control points; the rest only shape
 * the rail. Indices must not go backwards, though two stations may share one.
 * Call it once when the rail is built, not every frame.
 */
export const getStationRailPositions = (
  curve: CatmullRomCurve3,
  controlPointIndices: readonly number[],
): number[] => {
  if (curve.closed) {
    throw new Error("Curve must be open");
  }

  const pointLength = curve.points.length;

  let prevIndex = -1;
  for (const index of controlPointIndices) {
    if (index < 0 || index > pointLength - 1) {
      throw new Error(`Index ${index} out of bounds`);
    }

    if (!Number.isInteger(index)) {
      throw new Error(`Index ${index} must be an integer`);
    }

    if (index < prevIndex) {
      throw new Error(
        `Index ${index} must be greater or equal to previous index ${prevIndex}`,
      );
    }

    prevIndex = index;
  }

  return controlPointIndices.map((index) => {
    const t = index / (pointLength - 1);
    return getTtoUmapping(curve, t);
  });
};

/**
 * Converts a non-uniform parameter `t` [0, 1] to an arc-length parameter `u`.
 */
const getTtoUmapping = (curve: CatmullRomCurve3, t: number): number => {
  // Cumulative arc lengths at evenly spaced t. Keep the default divisions:
  // getPointAt maps u back to t through this same table, so reading it in
  // reverse is its exact inverse. Another count would approximate the length
  // differently, and the resulting u would miss the control point slightly.
  const lengths = curve.getLengths();
  const totalLength = lengths[lengths.length - 1];

  if (totalLength === 0) {
    return 0;
  }

  const exactIndex = t * (lengths.length - 1);
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.ceil(exactIndex);

  const fraction = exactIndex - lowerIndex;
  const currentLength =
    lengths[lowerIndex] +
    (lengths[upperIndex] - lengths[lowerIndex]) * fraction;

  return currentLength / totalLength;
};

/**
 * Maps scroll progress to a position on the rail (`u`, for `getCameraState`).
 * The camera holds still at its station for the whole dwell and eases between
 * stations during a flight, so it stops and starts at speed 0. The first
 * station flies in from the start of the rail. `stationRanges` and
 * `stationRailPositions` must list the same stations in the same order.
 * Called every frame, so it allocates nothing.
 */
export const getRailProgress = (
  progress: number,
  stationRanges: readonly StationRange[],
  stationRailPositions: readonly number[],
): number => {
  const clampedProgress = MathUtils.clamp(progress, 0, 1);

  const stationIndex = getStationIndex(clampedProgress, stationRanges);
  const { flightStart, flightEnd } = stationRanges[stationIndex];
  const currentStationRailPosition = stationRailPositions[stationIndex];

  // dwell part
  if (clampedProgress >= flightEnd) {
    return currentStationRailPosition;
  }

  // flight part
  const prevStationRailPosition =
    stationIndex > 0 ? stationRailPositions[stationIndex - 1] : 0;

  const easedProgress = MathUtils.smoothstep(progress, flightStart, flightEnd);
  return MathUtils.lerp(
    prevStationRailPosition,
    currentStationRailPosition,
    easedProgress,
  );
};
