import { describe, expect, it } from "vitest";
import { starPolygon } from "@/lib/shapes/star";
import { normalize } from "./normalize";

/** Float32 keeps about 7 significant digits; 5 decimal places is safe. */
const DIGITS = 5;

const pointCount = (points: Float32Array) => points.length / 3;

const pointAt = (points: Float32Array, i: number) =>
  Array.from(points.subarray(i * 3, i * 3 + 3));

/** The middle of the bounding box, per axis. */
const bboxCentre = (points: Float32Array) =>
  [0, 1, 2].map((axis) => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = axis; i < points.length; i += 3) {
      min = Math.min(min, points[i]);
      max = Math.max(max, points[i]);
    }
    return (min + max) / 2;
  });

/** The mean of the points, per axis: what a wrong centre would use. */
const centroid = (points: Float32Array) =>
  [0, 1, 2].map((axis) => {
    let sum = 0;
    for (let i = axis; i < points.length; i += 3) {
      sum += points[i];
    }
    return sum / pointCount(points);
  });

/** Distance of the farthest point from the origin. */
const farthestFromOrigin = (points: Float32Array) => {
  let farthest = 0;
  for (let i = 0; i < points.length; i += 3) {
    farthest = Math.max(
      farthest,
      Math.hypot(points[i], points[i + 1], points[i + 2]),
    );
  }
  return farthest;
};

/**
 * Off the origin, spread on all three axes, and lopsided: five points crowd
 * the left end, so the mean sits well left of the bounding box's middle, and
 * a centre taken from the mean shows.
 */
// biome-ignore format: one point per line
const LOPSIDED = new Float32Array([
  10, 20, 5,
  10.2, 20.1, 5,
  10.4, 19.9, 5.2,
  10.6, 20.2, 4.9,
  10.8, 20, 5.1,
  18, 23, 6,
  14, 26, 3,
]);

describe("normalize", () => {
  it("is set up with a shape the mean would centre wrongly", () => {
    // Guards the fixture: if these matched, the next test would prove nothing.
    expect(centroid(LOPSIDED)[0]).not.toBeCloseTo(bboxCentre(LOPSIDED)[0], 1);
  });

  it("centres the bounding box on the origin", () => {
    for (const value of bboxCentre(normalize(LOPSIDED))) {
      expect(value).toBeCloseTo(0, DIGITS);
    }
  });

  it("puts the farthest point exactly 1 from the origin", () => {
    expect(farthestFromOrigin(normalize(LOPSIDED))).toBeCloseTo(1, DIGITS);
  });

  it("keeps the shape: every point moves by one shift and one positive scale", () => {
    // If result = (input − centre) × scale, then the offset of any point from
    // point 0 is the input's offset times the same scale. A stretch along one
    // axis, a mirror or a rotation would all break this.
    const result = normalize(LOPSIDED);
    const input0 = pointAt(LOPSIDED, 0);
    const result0 = pointAt(result, 0);

    const input1 = pointAt(LOPSIDED, 5);
    const result1 = pointAt(result, 5);
    const scale =
      Math.hypot(...result1.map((v, axis) => v - result0[axis])) /
      Math.hypot(...input1.map((v, axis) => v - input0[axis]));

    for (let i = 0; i < pointCount(LOPSIDED); i++) {
      const input = pointAt(LOPSIDED, i);
      const actual = pointAt(result, i);
      for (let axis = 0; axis < 3; axis++) {
        expect(actual[axis] - result0[axis]).toBeCloseTo(
          (input[axis] - input0[axis]) * scale,
          DIGITS,
        );
      }
    }
  });

  it("keeps the point count", () => {
    // The order is covered above: each point is checked against its own
    // input point.
    expect(normalize(LOPSIDED)).toHaveLength(LOPSIDED.length);
  });

  it("leaves a shape already centred in the unit circle as it is", () => {
    // {8/3} visits the top, bottom, left and right of the unit circle, so its
    // bounding box is already centred and its farthest point already 1 away.
    const star = starPolygon(8, 3);
    const result = normalize(star);
    for (let i = 0; i < star.length; i++) {
      expect(result[i]).toBeCloseTo(star[i], DIGITS);
    }
  });

  it("changes nothing when applied twice", () => {
    const once = normalize(LOPSIDED);
    const twice = normalize(once);
    for (let i = 0; i < once.length; i++) {
      expect(twice[i]).toBeCloseTo(once[i], DIGITS);
    }
  });

  it("leaves its input untouched", () => {
    const copy = LOPSIDED.slice();
    normalize(LOPSIDED);
    expect(LOPSIDED).toEqual(copy);
  });

  it.each([
    { name: "a single point", points: new Float32Array([3, -2, 7]) },
    {
      name: "points that all coincide",
      points: new Float32Array([3, -2, 7, 3, -2, 7, 3, -2, 7]),
    },
  ])("centres $name on the origin without NaN", ({ points }) => {
    const result = normalize(points);
    for (const value of result) {
      expect(Number.isNaN(value)).toBe(false);
      expect(value).toBeCloseTo(0, DIGITS);
    }
  });

  it("rejects an empty array", () => {
    expect(() => normalize(new Float32Array())).toThrow(RangeError);
  });
});
