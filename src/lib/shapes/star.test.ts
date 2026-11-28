import { beforeAll, describe, expect, it } from "vitest";
import { starPolygon } from "./star";

/** One step round the circle, in radians. */
const stepAngle = (n: number) => (2 * Math.PI) / n;

/**
 * Which of the circle's n points a vertex sits on: point 0 is at the top, and
 * the count runs anticlockwise.
 */
const toCircleIndex = (x: number, y: number, n: number) => {
  const angle = Math.atan2(y, x) - Math.PI / 2;
  const index = Math.round(angle / stepAngle(n));
  return ((index % n) + n) % n;
};

const orderOf = (points: Float32Array, n: number) =>
  Array.from({ length: points.length / 3 }, (_, i) =>
    toCircleIndex(points[i * 3], points[i * 3 + 1], n),
  );

const distanceBetween = (points: Float32Array, a: number, b: number) =>
  Math.hypot(
    points[b * 3] - points[a * 3],
    points[b * 3 + 1] - points[a * 3 + 1],
    points[b * 3 + 2] - points[a * 3 + 2],
  );

// Worked out by hand: vertex i sits on circle point (i × k) mod n.
const specs = [
  { n: 8, k: 3, expectedOrder: [0, 3, 6, 1, 4, 7, 2, 5] },
  { n: 5, k: 2, expectedOrder: [0, 2, 4, 1, 3] },
  { n: 4, k: 1, expectedOrder: [0, 1, 2, 3] },
  // The same shape as {8/3}, drawn the other way round.
  { n: 8, k: 5, expectedOrder: [0, 5, 2, 7, 4, 1, 6, 3] },
];

describe("starPolygon", () => {
  describe.each(specs)("{$n/$k}", ({ n, k, expectedOrder }) => {
    // Called in beforeAll, not in the describe body: the body runs while
    // Vitest collects the tests, and a throw there drops the whole file.
    let points: Float32Array;
    beforeAll(() => {
      points = starPolygon(n, k);
    });

    it("has n vertices, without repeating the first at the end", () => {
      expect(points).toHaveLength(n * 3);
    });

    it("visits the circle's points in order", () => {
      expect(orderOf(points, n)).toEqual(expectedOrder);
    });

    it("visits every point once", () => {
      expect(new Set(orderOf(points, n)).size).toBe(n);
    });

    it("steps from the last vertex back to the first", () => {
      const order = orderOf(points, n);
      expect((order[n - 1] + k) % n).toBe(order[0]);
    });

    it("keeps every vertex on the unit circle at z = 0", () => {
      for (let i = 0; i < n; i += 1) {
        expect(Math.hypot(points[i * 3], points[i * 3 + 1])).toBeCloseTo(1, 5);
        expect(points[i * 3 + 2]).toBe(0);
      }
    });

    it("has edges of equal length, the closing one included", () => {
      // A chord spanning k steps of n.
      const chord = 2 * Math.sin((Math.PI * k) / n);
      for (let i = 0; i < n; i += 1) {
        expect(distanceBetween(points, i, (i + 1) % n)).toBeCloseTo(chord, 5);
      }
    });
  });

  it("draws {4/1} as a square, starting at the top", () => {
    const expected = [
      [0, 1, 0],
      [-1, 0, 0],
      [0, -1, 0],
      [1, 0, 0],
    ].flat();
    const points = starPolygon(4, 1);

    expected.forEach((value, i) => {
      expect(points[i]).toBeCloseTo(value, 5);
    });
  });

  const unsupportedSpecs = [
    { name: "n and k share a factor, so it is not one stroke", n: 8, k: 2 },
    { name: "n and k share a factor, k is half of n", n: 6, k: 3 },
    { name: "n and k share a factor, k is one third of n", n: 10, k: 4 },
    { name: "k is 0", n: 8, k: 0 },
    { name: "k is n", n: 8, k: 8 },
    { name: "fewer than 3 points", n: 2, k: 1 },
  ];

  it.each(unsupportedSpecs)("rejects {$n/$k}: $name", ({ n, k }) => {
    expect(() => starPolygon(n, k)).toThrow(RangeError);
  });
});
