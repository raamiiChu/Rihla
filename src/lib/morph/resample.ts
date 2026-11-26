type ResampleOptions = {
  /**
   * A closed curve also counts the segment from the last point back to the
   * first, and its last sample does not repeat the first.
   */
  closed: boolean;
};

type ResampleResult = {
  /** `count` points, `[x0, y0, z0, x1, y1, z1, ...]`, evenly spaced by arc length. */
  points: Float32Array;
  /**
   * Each source vertex's arc-length fraction, from 0 to 1. Exact values: the
   * samples rarely land on a vertex, so convert to an index only when needed.
   */
  sourceT: Float64Array;
};

const getDistance = (src: Float32Array, vertexA: number, vertexB: number) =>
  Math.sqrt(
    (src[vertexB * 3] - src[vertexA * 3]) ** 2 +
      (src[vertexB * 3 + 1] - src[vertexA * 3 + 1]) ** 2 +
      (src[vertexB * 3 + 2] - src[vertexA * 3 + 2]) ** 2,
  );

/**
 * Resamples a polyline into `count` points spread evenly along its length.
 *
 * - Open: spacing is `L / (count - 1)`; the first and last samples match the
 *   source's ends.
 * - Closed: spacing is `L / count`, with the closing segment included in `L`.
 *
 * @param src Source vertices, `[x0, y0, z0, x1, y1, z1, ...]`.
 */
export const resample = (
  src: Float32Array,
  count: number,
  { closed }: ResampleOptions,
): ResampleResult => {
  if (count < 2) {
    throw new RangeError("resample: count must be at least 2");
  }

  if (src.length % 3 !== 0) {
    throw new RangeError("resample: length of src must be a multiple of 3");
  }

  const vertexCount = src.length / 3;
  if (vertexCount < 2) {
    throw new RangeError("resample: src must have at least 2 vertices");
  }

  // A closed curve adds the segment from the last vertex back to the first.
  const segmentCount = closed ? vertexCount : vertexCount - 1;

  const points = new Float32Array(count * 3);
  // How far along the line each segment starts, plus the total at the end.
  const accumulatedDistances = new Float64Array(segmentCount + 1);

  for (let i = 0; i < segmentCount; i += 1) {
    // `% vertexCount` sends the closing segment's end back to vertex 0.
    const distance = getDistance(src, i, (i + 1) % vertexCount);
    accumulatedDistances[i + 1] = accumulatedDistances[i] + distance;
  }

  const totalLength = accumulatedDistances[segmentCount];

  if (totalLength === 0) {
    throw new RangeError(
      "resample: total length of src must be greater than 0",
    );
  }

  // Only the first vertexCount entries belong to a vertex; a closed curve's
  // extra entry is the way back to the start.
  const sourceT = accumulatedDistances
    .subarray(0, vertexCount)
    .map((distance) => distance / totalLength);

  const spacing = totalLength / (closed ? count : count - 1);

  let segment = 0;
  for (let i = 0; i < count; i += 1) {
    const target = i * spacing;

    while (
      segment < segmentCount - 1 &&
      accumulatedDistances[segment + 1] < target
    ) {
      segment += 1;
    }

    const startVertex = segment;
    const endVertex = (segment + 1) % vertexCount;
    const segmentLength =
      accumulatedDistances[startVertex + 1] - accumulatedDistances[startVertex];
    const ratio =
      segmentLength > 0
        ? (target - accumulatedDistances[startVertex]) / segmentLength
        : 0;

    for (let axis = 0; axis < 3; axis += 1) {
      const start = src[startVertex * 3 + axis];
      const end = src[endVertex * 3 + axis];
      points[i * 3 + axis] = start + (end - start) * ratio;
    }
  }

  return { points, sourceT };
};

/**
 * Converts an arc-length fraction from `sourceT` into the index of the
 * nearest sample of a `resample` result with the same `count` and `closed`.
 */
export const getNearestSampleIndex = (
  t: number,
  count: number,
  { closed }: ResampleOptions,
): number => {
  if (t < 0 || t > 1) {
    throw new RangeError("getNearestSampleIndex: t must be between 0 and 1");
  }

  if (count < 2) {
    throw new RangeError("getNearestSampleIndex: count must be at least 2");
  }

  const index = Math.round(t * (closed ? count : count - 1));

  // On a closed curve, index `count` is the way back round to sample 0.
  if (index === count) {
    return 0;
  }

  return index;
};

export type { ResampleOptions, ResampleResult };
