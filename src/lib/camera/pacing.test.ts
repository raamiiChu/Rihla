import { CatmullRomCurve3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { StationRange } from "@/lib/timeline/stations";
import { getRailProgress, getStationRailPositions } from "./pacing";

const TOLERANCE = 1e-6;

// Segments of very different lengths, so u and t disagree at every inner point.
const UNEVEN_POINTS = [
  new Vector3(0, 0, 0),
  new Vector3(0, 0, -2),
  new Vector3(0, 0, -20),
  new Vector3(5, 3, -30),
  new Vector3(0, 0, -60),
];
const UNEVEN_CURVE = new CatmullRomCurve3(UNEVEN_POINTS);
const ALL_INDICES = UNEVEN_POINTS.map((_, i) => i);

// Evenly spaced on a straight line, so u should equal t.
const EVEN_CURVE = new CatmullRomCurve3(
  [0, 1, 2, 3, 4].map((i) => new Vector3(0, 0, -10 * i)),
);

describe("getStationRailPositions", () => {
  describe("positions", () => {
    it("lands on each control point through getPointAt", () => {
      const positions = getStationRailPositions(UNEVEN_CURVE, ALL_INDICES);
      positions.forEach((u, i) => {
        const point = UNEVEN_CURVE.getPointAt(u);
        expect(point.distanceTo(UNEVEN_POINTS[i])).toBeLessThan(TOLERANCE);
      });
    });

    it("puts the first control point at 0 and the last at 1", () => {
      const positions = getStationRailPositions(UNEVEN_CURVE, ALL_INDICES);
      expect(positions[0]).toBe(0);
      expect(positions.at(-1)).toBe(1);
    });

    it("measures by arc length, not by control point count", () => {
      // The first segment is 2 of roughly 70 units, far below t = 1/4.
      const [, second] = getStationRailPositions(UNEVEN_CURVE, [0, 1]);
      expect(second).toBeLessThan(0.1);
    });

    it("matches t on an evenly spaced straight rail", () => {
      const positions = getStationRailPositions(EVEN_CURVE, [0, 1, 2, 3, 4]);
      positions.forEach((u, i) => {
        expect(u).toBeCloseTo(i / 4, 3);
      });
    });

    it("returns one position per index, in order", () => {
      const positions = getStationRailPositions(UNEVEN_CURVE, [0, 2, 4]);
      expect(positions).toHaveLength(3);
      expect(positions[0]).toBeLessThan(positions[1]);
      expect(positions[1]).toBeLessThan(positions[2]);
    });

    it("can skip control points that only shape the rail", () => {
      const positions = getStationRailPositions(UNEVEN_CURVE, [1, 3]);
      expect(
        UNEVEN_CURVE.getPointAt(positions[0]).distanceTo(UNEVEN_POINTS[1]),
      ).toBeLessThan(TOLERANCE);
      expect(
        UNEVEN_CURVE.getPointAt(positions[1]).distanceTo(UNEVEN_POINTS[3]),
      ).toBeLessThan(TOLERANCE);
    });
  });

  it("allows two stations on the same control point", () => {
    const [first, second] = getStationRailPositions(UNEVEN_CURVE, [2, 2]);
    expect(second).toBe(first);
  });

  describe("validation", () => {
    it("throws on a closed curve", () => {
      const closed = new CatmullRomCurve3(UNEVEN_POINTS, true);
      expect(() => getStationRailPositions(closed, [0, 1])).toThrow();
    });

    it.each([
      { name: "a negative index", indices: [-1, 2] },
      { name: "an index past the last point", indices: [0, 5] },
      { name: "a non-integer index", indices: [0, 1.5] },
      { name: "indices that go backwards", indices: [0, 3, 2] },
    ])("throws on $name", ({ indices }) => {
      expect(() => getStationRailPositions(UNEVEN_CURVE, indices)).toThrow();
    });
  });
});

// Flights: b 0.2–0.3, c 0.5–0.7. Dwells: a 0–0.2, b 0.3–0.5, c 0.7–1.
const RANGES: StationRange[] = [
  { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.2 },
  { id: "b", flightStart: 0.2, flightEnd: 0.3, dwellEnd: 0.5 },
  { id: "c", flightStart: 0.5, flightEnd: 0.7, dwellEnd: 1 },
];
const RAIL_POSITIONS = [0, 0.4, 1];

// Progress values from 0 to 1 in even steps, for properties that hold everywhere.
const SWEEP = Array.from({ length: 1001 }, (_, i) => i / 1000);

describe("getRailProgress", () => {
  describe("lookup", () => {
    it.each([
      { name: "the first dwell", progress: 0.1, expected: 0 },
      { name: "the start of a flight", progress: 0.2, expected: 0 },
      { name: "the middle of a flight", progress: 0.25, expected: 0.2 },
      { name: "the end of a flight", progress: 0.3, expected: 0.4 },
      { name: "a dwell", progress: 0.4, expected: 0.4 },
      { name: "the middle of the last flight", progress: 0.6, expected: 0.7 },
      { name: "the end", progress: 1, expected: 1 },
    ])("$name ($progress) is at $expected", ({ progress, expected }) => {
      expect(getRailProgress(progress, RANGES, RAIL_POSITIONS)).toBeCloseTo(
        expected,
        10,
      );
    });
  });

  describe("dwells", () => {
    it("holds still for a whole dwell", () => {
      for (const progress of [0.3, 0.35, 0.4, 0.45, 0.4999]) {
        expect(getRailProgress(progress, RANGES, RAIL_POSITIONS)).toBe(0.4);
      }
    });

    it("eases out of a flight, so the speed is near 0 at its ends", () => {
      const step = 1e-4;
      const leaving = getRailProgress(0.2 + step, RANGES, RAIL_POSITIONS);
      const arriving = getRailProgress(0.3 - step, RANGES, RAIL_POSITIONS);
      // A linear flight would move 0.4 * step / 0.1 = 4e-4 here.
      expect(leaving).toBeLessThan(1e-5);
      expect(0.4 - arriving).toBeLessThan(1e-5);
    });
  });

  describe("first station", () => {
    it("flies in from the start of the rail when its flight is not 0", () => {
      const ranges: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0.2, dwellEnd: 0.5 },
        { id: "b", flightStart: 0.5, flightEnd: 0.7, dwellEnd: 1 },
      ];
      const positions = [0.3, 1];
      expect(getRailProgress(0, ranges, positions)).toBe(0);
      expect(getRailProgress(0.1, ranges, positions)).toBeCloseTo(0.15, 10);
      expect(getRailProgress(0.2, ranges, positions)).toBe(0.3);
    });

    it("rests where it sits on the rail when its flight is 0", () => {
      const positions = [0.1, 0.4, 1];
      expect(getRailProgress(0, RANGES, positions)).toBe(0.1);
    });
  });

  describe("out of range", () => {
    it("stays at the first station below 0", () => {
      const positions = [0.1, 0.4, 1];
      expect(getRailProgress(-0.5, RANGES, positions)).toBe(0.1);
    });

    it("stays at the last station above 1", () => {
      expect(getRailProgress(1.5, RANGES, RAIL_POSITIONS)).toBe(1);
    });
  });

  describe("properties", () => {
    it("produces no NaN across a zero-length flight", () => {
      const ranges: StationRange[] = [
        { id: "a", flightStart: 0, flightEnd: 0, dwellEnd: 0.5 },
        { id: "b", flightStart: 0.5, flightEnd: 0.5, dwellEnd: 1 },
      ];
      for (const progress of SWEEP) {
        expect(Number.isNaN(getRailProgress(progress, ranges, [0, 1]))).toBe(
          false,
        );
      }
    });

    it("never goes back as progress grows", () => {
      let previous = 0;
      for (const progress of SWEEP) {
        const u = getRailProgress(progress, RANGES, RAIL_POSITIONS);
        expect(u).toBeGreaterThanOrEqual(previous);
        previous = u;
      }
    });

    it("never jumps between neighbouring progress values", () => {
      // smoothstep peaks at 1.5 times the average speed. The steepest flight
      // is b: 1.5 * 0.4 / 0.1 = 6 per unit of progress, so one step of 0.001
      // moves at most 0.006. A jump between stations would be 0.4 or more.
      let previous = getRailProgress(0, RANGES, RAIL_POSITIONS);
      for (const progress of SWEEP) {
        const u = getRailProgress(progress, RANGES, RAIL_POSITIONS);
        expect(Math.abs(u - previous)).toBeLessThan(0.007);
        previous = u;
      }
    });
  });
});
