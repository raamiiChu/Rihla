import { describe, expect, it } from "vitest";
import { align, reverse, rotateStart } from "./align";
import { resample } from "./resample";

/**
 * n points tagged with their index: point i is (i, 10 + i, 20 + i), so a
 * reordered copy can be read back as a list of indices. A point whose y or z
 * did not move with its x is caught, and so is a slot never written, which
 * stays (0, 0, 0).
 */
const tagged = (n: number) =>
  new Float32Array(
    Array.from({ length: n }, (_, i) => [i, 10 + i, 20 + i]).flat(),
  );

/** Reads the indices back out of a reordered `tagged` array. */
const orderOf = (points: Float32Array) =>
  Array.from({ length: points.length / 3 }, (_, i) => {
    const [x, y, z] = points.subarray(i * 3, i * 3 + 3);
    expect([y, z], `point ${i} is not a whole tagged point`).toEqual([
      10 + x,
      20 + x,
    ]);
    return x;
  });

/** Sum of the distances between matching points: what `align` minimises. */
const totalDistance = (a: Float32Array, b: Float32Array) => {
  let total = 0;
  for (let i = 0; i < a.length; i += 3) {
    total += Math.hypot(a[i] - b[i], a[i + 1] - b[i + 1], a[i + 2] - b[i + 2]);
  }
  return total;
};

/**
 * A closed shape with no symmetry, so exactly one start and direction match
 * it to itself; resampled closed, as `align` expects.
 */
const LOPSIDED = resample(
  // biome-ignore format: one vertex per line
  new Float32Array([
    0, 1, 0,
    0.4, 0.2, 0,
    1.2, -0.3, 0,
    0.1, -0.6, 0,
    -0.9, -0.8, 0,
    -0.5, 0.3, 0,
  ]),
  48,
  { closed: true },
).points;

const COUNT = LOPSIDED.length / 3;

describe("rotateStart", () => {
  it.each([
    { start: 0, expected: [0, 1, 2, 3, 4] },
    { start: 1, expected: [1, 2, 3, 4, 0] },
    { start: 3, expected: [3, 4, 0, 1, 2] },
    // Whole turns, and backwards, wrap round the loop.
    { start: 5, expected: [0, 1, 2, 3, 4] },
    { start: 7, expected: [2, 3, 4, 0, 1] },
    { start: -1, expected: [4, 0, 1, 2, 3] },
  ])("starts at point $start", ({ start, expected }) => {
    expect(orderOf(rotateStart(tagged(5), start))).toEqual(expected);
  });

  it("leaves its input untouched", () => {
    const points = tagged(5);
    rotateStart(points, 2);
    expect(points).toEqual(tagged(5));
  });
});

describe("reverse", () => {
  it.each([
    { n: 2, expected: [0, 1] },
    { n: 4, expected: [0, 3, 2, 1] },
    { n: 5, expected: [0, 4, 3, 2, 1] },
  ])(
    "runs $n points the other way, keeping point 0 first",
    ({ n, expected }) => {
      expect(orderOf(reverse(tagged(n)))).toEqual(expected);
    },
  );

  it("comes back to the start when applied twice", () => {
    expect(reverse(reverse(tagged(6)))).toEqual(tagged(6));
  });

  it("leaves its input untouched", () => {
    const points = tagged(5);
    reverse(points);
    expect(points).toEqual(tagged(5));
  });
});

describe("align", () => {
  // Shuffle LOPSIDED by a known start and direction; align should undo it.
  it.each([
    { start: 0, reversed: false },
    { start: 7, reversed: false },
    { start: 30, reversed: false },
    { start: 0, reversed: true },
    { start: 11, reversed: true },
  ])("undoes a start of $start, reversed: $reversed", ({ start, reversed }) => {
    const rotated = rotateStart(LOPSIDED, start);
    const shuffled = reversed ? reverse(rotated) : rotated;

    expect(align(shuffled, LOPSIDED)).toEqual(LOPSIDED);
  });

  describe("against a different shape", () => {
    // A circle the other way round and from another start, against LOPSIDED.
    const circle = reverse(
      rotateStart(
        resample(
          new Float32Array(
            Array.from({ length: 64 }, (_, i) => {
              const angle = (i / 64) * 2 * Math.PI;
              return [Math.cos(angle), Math.sin(angle), 0];
            }).flat(),
          ),
          COUNT,
          { closed: true },
        ).points,
        COUNT / 3,
      ),
    );

    it("is no further from the target than before", () => {
      expect(
        totalDistance(align(circle, LOPSIDED), LOPSIDED),
      ).toBeLessThanOrEqual(totalDistance(circle, LOPSIDED));
    });

    it("is no further from the target than any start in either direction", () => {
      const aligned = totalDistance(align(circle, LOPSIDED), LOPSIDED);

      for (const candidate of [circle, reverse(circle)]) {
        for (let start = 0; start < COUNT; start += 1) {
          const distance = totalDistance(
            rotateStart(candidate, start),
            LOPSIDED,
          );
          expect(aligned).toBeLessThanOrEqual(distance + 1e-6);
        }
      }
    });

    it("leaves its input untouched", () => {
      const copy = circle.slice();
      align(circle, LOPSIDED);
      expect(circle).toEqual(copy);
    });
  });

  it("rejects arrays of different lengths", () => {
    expect(() => align(LOPSIDED, LOPSIDED.subarray(3))).toThrow(RangeError);
  });
});
