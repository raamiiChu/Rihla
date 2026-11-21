import { describe, expect, it } from "vitest";
import { STATION_WEIGHTS } from "@/data/timeline";
import {
  buildStationRanges,
  countDestinationsBetween,
  getSkipDestination,
  getStationIndex,
  type StationRange,
  type StationWeights,
} from "./stations";

// Weights summing to 20, so every boundary is a round fraction.
const THREE_STATIONS: StationWeights[] = [
  { id: "a", flight: 0, dwell: 4 },
  { id: "b", flight: 2, dwell: 4 },
  { id: "c", flight: 4, dwell: 6 },
];

const THREE_STATION_RANGES: StationRange[] = [
  { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.2 },
  { id: "b", flightStart: 0.2, flightEnd: 0.3, dwellEnd: 0.5 },
  { id: "c", flightStart: 0.5, flightEnd: 0.7, dwellEnd: 1 },
];

// Boundaries are divisions, so compare with a tolerance rather than exactly.
const expectRangesCloseTo = (
  actual: readonly StationRange[],
  expected: readonly StationRange[],
) => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((range, i) => {
    expect(range.id).toBe(expected[i].id);
    expect(range.flightStart).toBeCloseTo(expected[i].flightStart, 10);
    expect(range.flightEnd).toBeCloseTo(expected[i].flightEnd, 10);
    expect(range.dwellEnd).toBeCloseTo(expected[i].dwellEnd, 10);
  });
};

// Rules every valid result must follow, whatever the weights.
const expectWellFormed = (ranges: readonly StationRange[]) => {
  expect(ranges[0].flightStart).toBe(0);
  expect(ranges.at(-1)?.dwellEnd).toBe(1);

  ranges.forEach((range, i) => {
    expect(range.flightStart).toBeLessThanOrEqual(range.flightEnd);
    expect(range.flightEnd).toBeLessThanOrEqual(range.dwellEnd);

    const next = ranges[i + 1];
    if (next) {
      expect(next.flightStart).toBe(range.dwellEnd);
    }
  });
};

describe("buildStationRanges", () => {
  describe("boundaries", () => {
    it.each([
      {
        name: "three stations",
        weights: THREE_STATIONS,
        expected: THREE_STATION_RANGES,
      },
      {
        name: "a single station dwells for the whole scroll",
        weights: [{ id: "a", flight: 0, dwell: 7 }],
        expected: [{ id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 1 }],
      },
      {
        name: "a zero dwell ends where its flight ends",
        weights: [
          { id: "a", flight: 0, dwell: 1 },
          { id: "b", flight: 1, dwell: 0 },
          { id: "c", flight: 1, dwell: 1 },
        ],
        expected: [
          { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.25 },
          { id: "b", flightStart: 0.25, flightEnd: 0.5, dwellEnd: 0.5 },
          { id: "c", flightStart: 0.5, flightEnd: 0.75, dwellEnd: 1 },
        ],
      },
    ])("$name", ({ weights, expected }) => {
      expectRangesCloseTo(buildStationRanges(weights), expected);
    });

    it("keeps the stations in their given order", () => {
      const ids = buildStationRanges(THREE_STATIONS).map((range) => range.id);
      expect(ids).toEqual(["a", "b", "c"]);
    });

    it("depends only on the ratios between weights", () => {
      const scaled = THREE_STATIONS.map((station) => ({
        ...station,
        flight: station.flight * 10,
        dwell: station.dwell * 10,
      }));
      expectRangesCloseTo(buildStationRanges(scaled), THREE_STATION_RANGES);
    });
  });

  describe("well-formed results", () => {
    it.each([
      { name: "three stations", weights: THREE_STATIONS },
      { name: "the production timeline", weights: STATION_WEIGHTS },
    ])("$name", ({ weights }) => {
      expectWellFormed(buildStationRanges(weights));
    });

    it("produces no NaN when flights are zero", () => {
      const ranges = buildStationRanges([
        { id: "a", flight: 0, dwell: 1 },
        { id: "b", flight: 0, dwell: 1 },
      ]);
      for (const range of ranges) {
        expect(Number.isNaN(range.flightStart)).toBe(false);
        expect(Number.isNaN(range.flightEnd)).toBe(false);
        expect(Number.isNaN(range.dwellEnd)).toBe(false);
      }
    });
  });

  describe("validation", () => {
    it.each([
      { name: "no stations", weights: [] },
      {
        name: "weights summing to 0",
        weights: [{ id: "a", flight: 0, dwell: 0 }],
      },
      {
        name: "a negative weight",
        weights: [
          { id: "a", flight: 0, dwell: 2 },
          { id: "b", flight: -1, dwell: 2 },
        ],
      },
      {
        name: "a non-finite weight",
        weights: [{ id: "a", flight: 0, dwell: Number.POSITIVE_INFINITY }],
      },
    ])("throws on $name", ({ weights }) => {
      expect(() => buildStationRanges(weights)).toThrow();
    });
  });
});

// Station "b" has neither flight nor dwell, so its range [0.5, 0.5) is empty.
const EMPTY_MIDDLE_RANGES: StationRange[] = [
  { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.5 },
  { id: "b", flightStart: 0.5, flightEnd: 0.5, dwellEnd: 0.5 },
  { id: "c", flightStart: 0.5, flightEnd: 0.75, dwellEnd: 1 },
];

// Progress values from 0 to 1 in even steps, for properties that hold everywhere.
const SWEEP = Array.from({ length: 1001 }, (_, i) => i / 1000);

describe("getStationIndex", () => {
  // THREE_STATION_RANGES: a [0, 0.2), b [0.2, 0.5), c [0.5, 1].
  describe("lookup", () => {
    it.each([
      { name: "the start", progress: 0, expected: 0 },
      { name: "the first dwell", progress: 0.1, expected: 0 },
      { name: "just before a boundary", progress: 0.2 - 1e-9, expected: 0 },
      {
        name: "a boundary, which opens the next station",
        progress: 0.2,
        expected: 1,
      },
      { name: "a flight", progress: 0.25, expected: 1 },
      { name: "where a flight meets its dwell", progress: 0.3, expected: 1 },
      { name: "a dwell", progress: 0.4, expected: 1 },
      { name: "the last flight", progress: 0.6, expected: 2 },
      { name: "the last dwell", progress: 0.85, expected: 2 },
      { name: "the end", progress: 1, expected: 2 },
    ])("$name ($progress) is station $expected", ({ progress, expected }) => {
      expect(getStationIndex(progress, THREE_STATION_RANGES)).toBe(expected);
    });
  });

  describe("out of range", () => {
    it.each([
      {
        name: "below 0 clamps to the first station",
        progress: -0.5,
        expected: 0,
      },
      {
        name: "above 1 clamps to the last station",
        progress: 1.5,
        expected: 2,
      },
    ])("$name", ({ progress, expected }) => {
      expect(getStationIndex(progress, THREE_STATION_RANGES)).toBe(expected);
    });
  });

  describe("empty ranges", () => {
    it("skips a station with no length at its own boundary", () => {
      expect(getStationIndex(0.5, EMPTY_MIDDLE_RANGES)).toBe(2);
    });

    it("never returns a station with no length", () => {
      for (const progress of SWEEP) {
        expect(getStationIndex(progress, EMPTY_MIDDLE_RANGES)).not.toBe(1);
      }
    });
  });

  describe("properties", () => {
    it("a single station covers the whole scroll", () => {
      const single: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 1 },
      ];
      for (const progress of [-1, 0, 0.5, 1, 2]) {
        expect(getStationIndex(progress, single)).toBe(0);
      }
    });

    it("never goes back as progress grows", () => {
      let previous = 0;
      for (const progress of SWEEP) {
        const index = getStationIndex(progress, THREE_STATION_RANGES);
        expect(index).toBeGreaterThanOrEqual(previous);
        previous = index;
      }
    });

    it("finds every production station at the middle of its dwell", () => {
      const ranges = buildStationRanges(STATION_WEIGHTS);
      ranges.forEach((range, i) => {
        const dwellMiddle = (range.flightEnd + range.dwellEnd) / 2;
        expect(getStationIndex(dwellMiddle, ranges)).toBe(i);
      });
    });
  });
});

describe("getSkipDestination", () => {
  // THREE_STATION_RANGES arrivals (flightEnd): a 0, b 0.3, c 0.7.
  describe("lookup", () => {
    it.each([
      {
        name: "the first dwell goes to the next station",
        progress: 0.1,
        expected: 0.3,
      },
      {
        name: "the start of a flight arrives at its station",
        progress: 0.2,
        expected: 0.3,
      },
      {
        name: "the middle of a flight arrives at its station",
        progress: 0.25,
        expected: 0.3,
      },
      {
        name: "an arrival goes on to the next station",
        progress: 0.3,
        expected: 0.7,
      },
      {
        name: "a dwell goes to the next station",
        progress: 0.4,
        expected: 0.7,
      },
      {
        name: "the last flight arrives at the last station",
        progress: 0.6,
        expected: 0.7,
      },
    ])("$name ($progress → $expected)", ({ progress, expected }) => {
      expect(getSkipDestination(progress, THREE_STATION_RANGES)).toBe(expected);
    });
  });

  describe("no next station", () => {
    it.each([
      { name: "the arrival at the last station", progress: 0.7 },
      { name: "the last dwell", progress: 0.85 },
      { name: "the end", progress: 1 },
      { name: "past the end", progress: 1.5 },
    ])("returns null at $name", ({ progress }) => {
      expect(getSkipDestination(progress, THREE_STATION_RANGES)).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("treats progress below 0 as the start", () => {
      expect(getSkipDestination(-0.5, THREE_STATION_RANGES)).toBe(0.3);
    });

    it("arrives at a first station that starts mid-flight", () => {
      const ranges: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0.2, dwellEnd: 0.5 },
        { id: "b", flightStart: 0.5, flightEnd: 0.7, dwellEnd: 1 },
      ];
      expect(getSkipDestination(0.1, ranges)).toBe(0.2);
    });

    it("passes over a station with no dwell", () => {
      // b's arrival, 0.5, is already c's flight, so b can never be shown.
      const ranges: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.25 },
        { id: "b", flightStart: 0.25, flightEnd: 0.5, dwellEnd: 0.5 },
        { id: "c", flightStart: 0.5, flightEnd: 0.75, dwellEnd: 1 },
      ];
      expect(getSkipDestination(0.1, ranges)).toBe(0.75);
    });
  });

  describe("properties", () => {
    it("always lands at the start of a dwell, ahead of the current progress", () => {
      for (const progress of SWEEP) {
        const destination = getSkipDestination(progress, THREE_STATION_RANGES);
        if (destination === null) {
          continue;
        }
        const index = getStationIndex(destination, THREE_STATION_RANGES);
        expect(destination).toBeGreaterThan(progress);
        expect(destination).toBe(THREE_STATION_RANGES[index].flightEnd);
      }
    });

    it("steps through every production station in order", () => {
      const ranges = buildStationRanges(STATION_WEIGHTS);
      ranges.forEach((range, i) => {
        const dwellMiddle = (range.flightEnd + range.dwellEnd) / 2;
        const next = ranges[i + 1];
        expect(getSkipDestination(dwellMiddle, ranges)).toBe(
          next ? next.flightEnd : null,
        );
      });
    });
  });
});

describe("countDestinationsBetween", () => {
  // Counts the dwells a jump crosses whole. THREE_STATION_RANGES dwells:
  // a [0, 0.2], b [0.3, 0.5], c [0.7, 1].
  describe("lookup", () => {
    it.each([
      { name: "a at rest to b", from: 0, to: 0.3, expected: 0 },
      { name: "a at rest to c, past b", from: 0, to: 0.7, expected: 1 },
      { name: "flying to b, then to c", from: 0.25, to: 0.7, expected: 1 },
      { name: "b at rest to c", from: 0.4, to: 0.7, expected: 0 },
      { name: "b back to a, only leaving b", from: 0.4, to: 0, expected: 0 },
      { name: "c back to a, past b", from: 0.85, to: 0, expected: 1 },
      { name: "b back to b", from: 0.3, to: 0.3, expected: 0 },
    ])("$name ($from → $to) passes $expected", ({ from, to, expected }) => {
      expect(countDestinationsBetween(from, to, THREE_STATION_RANGES)).toBe(
        expected,
      );
    });
  });

  describe("edge cases", () => {
    it("does not count either end", () => {
      // Both ends sit exactly on an arrival.
      expect(countDestinationsBetween(0.3, 0.7, THREE_STATION_RANGES)).toBe(0);
    });

    it("does not count a station with no dwell", () => {
      // b's arrival, 0.5, has nothing to show, so flying past it is fine.
      const ranges: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.25 },
        { id: "b", flightStart: 0.25, flightEnd: 0.5, dwellEnd: 0.5 },
        { id: "c", flightStart: 0.5, flightEnd: 0.75, dwellEnd: 1 },
      ];
      expect(countDestinationsBetween(0, 0.75, ranges)).toBe(0);
    });

    it("clamps progress outside 0–1", () => {
      expect(countDestinationsBetween(-0.5, 0.7, THREE_STATION_RANGES)).toBe(1);
      expect(countDestinationsBetween(0.1, 1.5, THREE_STATION_RANGES)).toBe(1);
    });
  });

  describe("properties", () => {
    it("counts the same in both directions", () => {
      const samples = SWEEP.filter((_, i) => i % 50 === 0);
      for (const from of samples) {
        for (const to of samples) {
          expect(countDestinationsBetween(from, to, THREE_STATION_RANGES)).toBe(
            countDestinationsBetween(to, from, THREE_STATION_RANGES),
          );
        }
      }
    });

    it("passes every station in between across the production timeline", () => {
      const ranges = buildStationRanges(STATION_WEIGHTS);
      const first = ranges[0].flightEnd;
      const last = ranges[ranges.length - 1].flightEnd;
      expect(countDestinationsBetween(first, last, ranges)).toBe(
        ranges.length - 2,
      );
    });
  });
});
