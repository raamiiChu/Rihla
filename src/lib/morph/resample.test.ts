import { describe, expect, it } from "vitest";
import { getNearestSampleIndex, resample } from "./resample";

type Point = readonly [number, number, number];

type Spec = {
  name: string;
  polyline: Float32Array;
  count: number;
  expectedPoints: Point[];
  expectedSourceT: number[];
};

/** Flattens points into the `[x0, y0, z0, x1, ...]` layout `resample` takes. */
const toPolyline = (...points: Point[]) => new Float32Array(points.flat());

/** Float output carries rounding error, so compare each value to 5 decimal places. */
const expectValuesCloseTo = (
  actual: ArrayLike<number>,
  expected: readonly number[],
) => {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((value, i) => {
    expect(actual[i]).toBeCloseTo(value, 5);
  });
};

// A unit square, anticlockwise from the origin: 3 long open, 4 closed.
const SQUARE = toPolyline([0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]);

const openSpecs: Spec[] = [
  {
    name: "a straight line with even vertices",
    polyline: toPolyline([0, 0, 0], [1, 0, 0], [2, 0, 0]),
    count: 3,
    expectedPoints: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
    ],
    expectedSourceT: [0, 0.5, 1],
  },
  {
    // Three vertices crowd the first 0.2 units, so evenly spaced samples
    // prove the output ignores how the vertices are spread.
    name: "a straight line with crowded vertices",
    polyline: toPolyline(
      [0, 0, 0],
      [0.1, 0, 0],
      [0.2, 0, 0],
      [3, 0, 0],
      [4, 0, 0],
    ),
    count: 5,
    expectedPoints: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [3, 0, 0],
      [4, 0, 0],
    ],
    expectedSourceT: [0, 0.025, 0.05, 0.75, 1],
  },
  {
    // L = 3, spaced by L / (count - 1) = 0.5: the samples land on every
    // corner and end on the last vertex.
    name: "a square left open",
    polyline: SQUARE,
    count: 7,
    expectedPoints: [
      [0, 0, 0],
      [0.5, 0, 0],
      [1, 0, 0],
      [1, 0.5, 0],
      [1, 1, 0],
      [0.5, 1, 0],
      [0, 1, 0],
    ],
    expectedSourceT: [0, 1 / 3, 2 / 3, 1],
  },
  {
    // Every axis changes along the first edge, which is 3 long (1² + 2² + 2²
    // = 9); the second runs 3 along z. L = 6, spaced 1.5, so the second
    // sample sits halfway along the diagonal.
    name: "a diagonal through 3D",
    polyline: toPolyline([0, 0, 0], [1, 2, 2], [1, 2, 5]),
    count: 5,
    expectedPoints: [
      [0, 0, 0],
      [0.5, 1, 1],
      [1, 2, 2],
      [1, 2, 3.5],
      [1, 2, 5],
    ],
    expectedSourceT: [0, 0.5, 1],
  },
  {
    // The repeated vertex adds a zero-length segment, which must not divide
    // by zero; both copies share the same fraction.
    name: "a repeated vertex",
    polyline: toPolyline([0, 0, 0], [1, 0, 0], [1, 0, 0], [2, 0, 0]),
    count: 3,
    expectedPoints: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
    ],
    expectedSourceT: [0, 0.5, 0.5, 1],
  },
];

const closedSpecs: Spec[] = [
  {
    // L = 4 with the closing edge, spaced by L / count = 0.5. The last sample
    // stops half an edge short of the origin instead of repeating it, and the
    // last vertex sits at 0.75, not 1.
    name: "a square",
    polyline: SQUARE,
    count: 8,
    expectedPoints: [
      [0, 0, 0],
      [0.5, 0, 0],
      [1, 0, 0],
      [1, 0.5, 0],
      [1, 1, 0],
      [0.5, 1, 0],
      [0, 1, 0],
      [0, 0.5, 0],
    ],
    expectedSourceT: [0, 0.25, 0.5, 0.75],
  },
  {
    // Closing a straight line doubles back: out to x = 2 and home again, L = 4.
    name: "a straight line, which doubles back",
    polyline: toPolyline([0, 0, 0], [1, 0, 0], [2, 0, 0]),
    count: 4,
    expectedPoints: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [1, 0, 0],
    ],
    expectedSourceT: [0, 0.25, 0.5],
  },
  {
    // Out along the diagonal and back: L = 6, spaced 1.5.
    name: "a diagonal through 3D, which doubles back",
    polyline: toPolyline([0, 0, 0], [1, 2, 2]),
    count: 4,
    expectedPoints: [
      [0, 0, 0],
      [0.5, 1, 1],
      [1, 2, 2],
      [0.5, 1, 1],
    ],
    expectedSourceT: [0, 0.5],
  },
  {
    // The square written with its first vertex repeated at the end, so the
    // closing segment is zero long. The samples match the plain square, and
    // the repeated vertex sits at 1.
    name: "a square that repeats its first vertex",
    polyline: toPolyline([0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]),
    count: 8,
    expectedPoints: [
      [0, 0, 0],
      [0.5, 0, 0],
      [1, 0, 0],
      [1, 0.5, 0],
      [1, 1, 0],
      [0.5, 1, 0],
      [0, 1, 0],
      [0, 0.5, 0],
    ],
    expectedSourceT: [0, 0.25, 0.5, 0.75, 1],
  },
];

// Lengths that are not whole numbers, so `k × spacing` gathers rounding error
// over many samples.
const IRREGULAR = toPolyline(
  [0, 0, 0],
  [0.3, 0, 0],
  [0.3, 0.7, 0],
  [1.1, 0.7, 0.2],
  [1.3, 1.9, 0.5],
);
const IRREGULAR_COUNT = 1000;

// Few enough samples that the corners fall between them, not on them.
const PROPERTY_COUNT = 50;

const unsupportedSpecs = [
  {
    name: "fewer than 2 samples, open",
    polyline: SQUARE,
    count: 1,
    closed: false,
  },
  {
    name: "fewer than 2 samples, closed",
    polyline: SQUARE,
    count: 1,
    closed: true,
  },
  {
    name: "a single vertex",
    polyline: toPolyline([1, 2, 3]),
    count: 4,
    closed: false,
  },
  {
    name: "a length that is not a multiple of 3",
    polyline: new Float32Array([0, 0, 0, 1, 0]),
    count: 4,
    closed: false,
  },
  {
    name: "vertices that all coincide",
    polyline: toPolyline([1, 1, 1], [1, 1, 1], [1, 1, 1]),
    count: 4,
    closed: true,
  },
  {
    name: "no vertices",
    polyline: new Float32Array(0),
    count: 4,
    closed: false,
  },
];

const vertexAt = (src: Float32Array, i: number): Point => [
  src[i * 3],
  src[i * 3 + 1],
  src[i * 3 + 2],
];

const distanceBetween = (p: Point, q: Point) =>
  Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);

/** Each segment's ends, including the way back to the start when closed. */
const segmentsOf = (src: Float32Array, closed: boolean) => {
  const vertexCount = src.length / 3;
  const segmentCount = closed ? vertexCount : vertexCount - 1;

  return Array.from({ length: segmentCount }, (_, i) => ({
    start: vertexAt(src, i),
    end: vertexAt(src, (i + 1) % vertexCount),
  }));
};

const lengthOf = (src: Float32Array, closed: boolean) =>
  segmentsOf(src, closed).reduce(
    (sum, { start, end }) => sum + distanceBetween(start, end),
    0,
  );

/**
 * Where a point lies along the polyline, worked out independently of
 * `resample`: project it onto every segment and keep the closest. `gap` is
 * how far the point sits off the line.
 */
const arcPositionOf = (point: Point, src: Float32Array, closed: boolean) => {
  let travelled = 0;
  let best = { offset: 0, gap: Number.POSITIVE_INFINITY };

  for (const { start, end } of segmentsOf(src, closed)) {
    const length = distanceBetween(start, end);

    if (length > 0) {
      const along =
        ((point[0] - start[0]) * (end[0] - start[0]) +
          (point[1] - start[1]) * (end[1] - start[1]) +
          (point[2] - start[2]) * (end[2] - start[2])) /
        length ** 2;
      const ratio = Math.min(Math.max(along, 0), 1);
      const projected: Point = [
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
        start[2] + (end[2] - start[2]) * ratio,
      ];
      const gap = distanceBetween(point, projected);

      if (gap < best.gap) {
        best = { offset: travelled + ratio * length, gap };
      }
    }

    travelled += length;
  }

  return best;
};

describe("resample", () => {
  describe.each([
    { kind: "open", closed: false, specs: openSpecs },
    { kind: "closed", closed: true, specs: closedSpecs },
  ])("$kind", ({ closed, specs }) => {
    it.each(specs)(
      "$name",
      ({ polyline, count, expectedPoints, expectedSourceT }) => {
        const result = resample(polyline, count, { closed });

        expectValuesCloseTo(result.points, expectedPoints.flat());
        expectValuesCloseTo(result.sourceT, expectedSourceT);
      },
    );
  });

  describe("many samples over irregular lengths", () => {
    it.each([
      { kind: "open", closed: false },
      { kind: "closed", closed: true },
    ])("$kind: returns count finite points", ({ closed }) => {
      const { points, sourceT } = resample(IRREGULAR, IRREGULAR_COUNT, {
        closed,
      });

      expect(points).toHaveLength(IRREGULAR_COUNT * 3);
      expect(points.every(Number.isFinite)).toBe(true);
      expect(sourceT.every(Number.isFinite)).toBe(true);
    });

    it("open: ends on the last vertex", () => {
      // The last target, (count - 1) × spacing, can drift past L; it must
      // still land on the last vertex rather than off the end.
      const { points } = resample(IRREGULAR, IRREGULAR_COUNT, {
        closed: false,
      });

      expectValuesCloseTo(points.slice(-3), [...IRREGULAR.slice(-3)]);
    });
  });

  describe.each([
    { kind: "open", closed: false },
    { kind: "closed", closed: true },
  ])("properties of an irregular polyline, $kind", ({ closed }) => {
    const { points, sourceT } = resample(IRREGULAR, PROPERTY_COUNT, {
      closed,
    });
    const samples = Array.from({ length: PROPERTY_COUNT }, (_, i) =>
      vertexAt(points, i),
    );
    const length = lengthOf(IRREGULAR, closed);
    const spacing = length / (closed ? PROPERTY_COUNT : PROPERTY_COUNT - 1);

    it("starts on the first vertex", () => {
      expectValuesCloseTo(samples[0], [...vertexAt(IRREGULAR, 0)]);
    });

    it("keeps every sample on the line", () => {
      for (const sample of samples) {
        expect(arcPositionOf(sample, IRREGULAR, closed).gap).toBeLessThan(1e-5);
      }
    });

    it("spaces neighbours evenly along the line, corners included", () => {
      // Straight-line gaps shrink when a corner falls between two samples,
      // so measure along the line instead.
      const offsets = samples.map(
        (sample) => arcPositionOf(sample, IRREGULAR, closed).offset,
      );
      // Sample 0 sits on the first vertex, which a closed curve also reaches
      // at the very end; pin it to the start.
      offsets[0] = 0;

      for (let i = 1; i < offsets.length; i += 1) {
        expect(offsets[i] - offsets[i - 1]).toBeCloseTo(spacing, 4);
      }

      if (closed) {
        // The way back to the start is one more spacing.
        expect(length - offsets[offsets.length - 1]).toBeCloseTo(spacing, 4);
      }
    });

    it("puts a sample within half a spacing of every vertex", () => {
      const vertexCount = IRREGULAR.length / 3;

      for (let v = 0; v < vertexCount; v += 1) {
        const vertex = vertexAt(IRREGULAR, v);
        const nearest = Math.min(
          ...samples.map((sample) => distanceBetween(vertex, sample)),
        );

        // A vertex exactly midway is exactly half a spacing away, so allow
        // for rounding at the boundary.
        expect(nearest).toBeLessThanOrEqual(spacing / 2 + 1e-6);
      }
    });

    it("gives sourceT from 0, never decreasing", () => {
      expect(sourceT[0]).toBe(0);

      for (let i = 1; i < sourceT.length; i += 1) {
        expect(sourceT[i]).toBeGreaterThanOrEqual(sourceT[i - 1]);
      }

      if (closed) {
        // The way back to the start still lies ahead of the last vertex.
        expect(sourceT[sourceT.length - 1]).toBeLessThan(1);
      } else {
        expect(sourceT[sourceT.length - 1]).toBeCloseTo(1, 10);
      }
    });
  });

  describe("unsupported input", () => {
    it.each(unsupportedSpecs)(
      "throws a RangeError for $name",
      ({ polyline, count, closed }) => {
        expect(() => resample(polyline, count, { closed })).toThrow(RangeError);
      },
    );
  });
});

describe("getNearestSampleIndex", () => {
  describe.each([
    {
      kind: "open",
      closed: false,
      // 5 samples sit at t = 0, 0.25, 0.5, 0.75 and 1.
      count: 5,
      specs: [
        { name: "the start", t: 0, expected: 0 },
        { name: "the end", t: 1, expected: 4 },
        { name: "a sample exactly", t: 0.5, expected: 2 },
        { name: "just past a sample", t: 0.3, expected: 1 },
        { name: "just short of halfway", t: 0.37, expected: 1 },
        { name: "just past halfway", t: 0.38, expected: 2 },
        // Exactly between samples 0 and 1: ties go to the later sample.
        { name: "a tie, which goes forward", t: 0.125, expected: 1 },
      ],
    },
    {
      kind: "closed",
      closed: true,
      // 8 samples sit at t = 0, 0.125, … 0.875; t = 1 is the start again.
      count: 8,
      specs: [
        { name: "the start", t: 0, expected: 0 },
        { name: "a sample exactly", t: 0.25, expected: 2 },
        { name: "nearer the last sample", t: 0.9, expected: 7 },
        // 0.97 is nearer the start, reached again at t = 1, than sample 7.
        {
          name: "near the end, which wraps to the start",
          t: 0.97,
          expected: 0,
        },
        // Exactly between sample 7 and the start: ties go forward, so wrap.
        { name: "a tie at the end, which wraps", t: 0.9375, expected: 0 },
        // A first vertex repeated at the end has t = 1.
        { name: "t = 1, which is the start", t: 1, expected: 0 },
      ],
    },
  ])("$kind, $count samples", ({ closed, count, specs }) => {
    it.each(specs)("$name: t = $t → $expected", ({ t, expected }) => {
      expect(getNearestSampleIndex(t, count, { closed })).toBe(expected);
    });
  });

  it("finds the square's corners", () => {
    const { sourceT } = resample(SQUARE, 8, { closed: true });
    const indices = [...sourceT].map((t) =>
      getNearestSampleIndex(t, 8, { closed: true }),
    );

    expect(indices).toEqual([0, 2, 4, 6]);
  });

  it.each([
    { kind: "open", closed: false },
    { kind: "closed", closed: true },
  ])(
    "$kind: maps every vertex of a resample to a sample within half a spacing",
    ({ closed }) => {
      const { points, sourceT } = resample(IRREGULAR, PROPERTY_COUNT, {
        closed,
      });
      const spacing =
        lengthOf(IRREGULAR, closed) /
        (closed ? PROPERTY_COUNT : PROPERTY_COUNT - 1);

      sourceT.forEach((t, v) => {
        const index = getNearestSampleIndex(t, PROPERTY_COUNT, { closed });

        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(PROPERTY_COUNT);
        expect(
          distanceBetween(vertexAt(IRREGULAR, v), vertexAt(points, index)),
        ).toBeLessThanOrEqual(spacing / 2 + 1e-6);
      });
    },
  );

  it.each([
    { name: "t below 0", t: -0.1, count: 5 },
    { name: "t above 1", t: 1.1, count: 5 },
    { name: "fewer than 2 samples", t: 0.5, count: 1 },
  ])("throws a RangeError for $name", ({ t, count }) => {
    expect(() => getNearestSampleIndex(t, count, { closed: false })).toThrow(
      RangeError,
    );
  });
});
