import { MathUtils } from "three";

/**
 * One station's share of the scroll. `flight` and `dwell` are relative
 * weights, not seconds or progress: the boundaries are derived from their sum.
 */
export type StationWeights = {
  id: string;
  /**
   * The flight into this station. On the first station, 0 starts the journey
   * at rest and anything above starts it mid-flight.
   */
  flight: number;
  /** The stay at this station, where the camera slows or stops. */
  dwell: number;
};

/**
 * One station's boundaries, in progress (0–1) rather than weights.
 * Its `dwellEnd` equals the next station's `flightStart`.
 */
export type StationRange = {
  id: string;
  /** Where the flight into this station begins. */
  flightStart: number;
  /** Where the flight ends and the dwell begins; equals `flightStart` when the flight weight is 0. */
  flightEnd: number;
  /** Where the dwell ends; 1 for the last station. */
  dwellEnd: number;
};

const assertValidWeight = (id: string, name: string, weight: number) => {
  if (!(weight >= 0 && Number.isFinite(weight))) {
    throw new Error(
      `${id}: ${name} weight must be non-negative and finite, got ${weight}`,
    );
  }
};

const assertValidWeights = (stationWeights: readonly StationWeights[]) => {
  stationWeights.forEach(({ id, flight, dwell }) => {
    assertValidWeight(id, "flight", flight);
    assertValidWeight(id, "dwell", dwell);
  });
};

/**
 * Converts each station's weights into progress boundaries by a running sum
 * divided by the total. Pure; call it once at load, not every frame.
 */
export const buildStationRanges = (
  stationWeights: readonly StationWeights[],
): readonly StationRange[] => {
  assertValidWeights(stationWeights);

  const totalWeight = stationWeights.reduce(
    (acc, { flight, dwell }) => acc + flight + dwell,
    0,
  );

  if (totalWeight <= 0) {
    throw new Error("Total weight must be positive");
  }

  let runningWeight = 0;
  return stationWeights.map(({ id, flight, dwell }) => {
    const flightStartWeight = runningWeight;
    const flightEndWeight = runningWeight + flight;
    const dwellEndWeight = flightEndWeight + dwell;

    runningWeight = dwellEndWeight;

    return {
      id,
      flightStart: flightStartWeight / totalWeight,
      flightEnd: flightEndWeight / totalWeight,
      dwellEnd: dwellEndWeight / totalWeight,
    };
  });
};

/**
 * The station whose range holds `progress`. Ranges are half-open,
 * [flightStart, dwellEnd), so a boundary belongs to the next station and a
 * station with no length is never returned. Progress outside 0–1 is clamped,
 * and 1 falls to the last station. Expects `ranges` from `buildStationRanges`:
 * ordered and contiguous, so checking `dwellEnd` alone is enough.
 */
export const getStationIndex = (
  progress: number,
  ranges: readonly StationRange[],
): number => {
  const clampedProgress = MathUtils.clamp(progress, 0, 1);

  const index = ranges.findIndex(({ dwellEnd }) => {
    return clampedProgress < dwellEnd;
  });

  return index === -1 ? ranges.length - 1 : index;
};

/**
 * The station whose dwell holds `progress`, or null mid-flight. Unlike
 * `getStationIndex`, which switches as soon as the flight into a station
 * begins, this only switches on arrival (`flightEnd`), so the narration shows
 * while the shape does and never during a flight. A station with no dwell is
 * never returned, not even at progress 1. Progress outside 0–1 is clamped.
 */
export const getDwellingStationIndex = (
  progress: number,
  ranges: readonly StationRange[],
): number | null => {
  const clampedProgress = MathUtils.clamp(progress, 0, 1);
  const stationIndex = getStationIndex(clampedProgress, ranges);
  const { flightEnd, dwellEnd } = ranges[stationIndex];

  const isDwelling = clampedProgress >= flightEnd && dwellEnd > flightEnd;

  return isDwelling ? stationIndex : null;
};

/**
 * Where SKIP lands: the arrival (`flightEnd`) of the first station still
 * ahead that has a dwell to show. Mid-flight, that is the station being flown
 * to; mid-dwell, the next one. A station with no dwell is passed over, since
 * its arrival already belongs to the next station. Returns null when no
 * station is left. Progress outside 0–1 is clamped.
 */
export const getSkipDestination = (
  progress: number,
  ranges: readonly StationRange[],
): number | null => {
  const clampedProgress = MathUtils.clamp(progress, 0, 1);

  const destination = ranges.find(
    ({ flightEnd, dwellEnd }) =>
      flightEnd > clampedProgress && dwellEnd > flightEnd,
  );

  return destination?.flightEnd ?? null;
};

/**
 * How many stations a jump between two progress values would fly straight
 * through: those whose whole dwell lies inside the jump, so its shape would
 * flash past. Partly crossed dwells do not count, since that is only leaving
 * the starting station or reaching the destination, and neither do stations
 * with no dwell. Symmetric, so jumping back counts the same as forward.
 * Progress outside 0–1 is clamped. Above 0, jump with `immediate` instead.
 */
export const countDestinationsBetween = (
  from: number,
  to: number,
  ranges: readonly StationRange[],
): number => {
  const clampedFrom = MathUtils.clamp(from, 0, 1);
  const clampedTo = MathUtils.clamp(to, 0, 1);

  const minimum = Math.min(clampedFrom, clampedTo);
  const maximum = Math.max(clampedFrom, clampedTo);

  return ranges.filter(({ flightEnd, dwellEnd }) => {
    return flightEnd > minimum && dwellEnd < maximum && dwellEnd > flightEnd;
  }).length;
};
