/**
 * Brings any integer, negative ones included, round into 0 to n − 1. JS's `%`
 * keeps the sign (`-1 % 5` is −1); adding n moves it a whole turn, which
 * leaves its place on the loop unchanged.
 */
const wrap = (x: number, n: number) => ((x % n) + n) % n;

/**
 * Starts a closed curve at another of its points, without moving any: point i
 * of the result is point (i + start) mod n of `points`.
 *
 * @param points `[x0, y0, z0, x1, y1, z1, ...]`, from a closed `resample`.
 * @param start The point to start at. Any integer: n is a whole turn, and a
 * negative value counts back from the end.
 * @returns A new array; `points` is untouched.
 */
export const rotateStart = (
  points: Float32Array,
  start: number,
): Float32Array => {
  if (!Number.isInteger(start)) {
    throw new RangeError("rotateStart: start must be an integer");
  }

  const rotated = new Float32Array(points.length);
  const vertexCount = points.length / 3;

  for (let i = 0; i < vertexCount; i++) {
    const sourceVertex = wrap(i + start, vertexCount);
    rotated[i * 3] = points[sourceVertex * 3];
    rotated[i * 3 + 1] = points[sourceVertex * 3 + 1];
    rotated[i * 3 + 2] = points[sourceVertex * 3 + 2];
  }
  return rotated;
};

/**
 * Runs a closed curve the other way round from the same start: point i of the
 * result is point (n − i) mod n of `points`, so point 0 stays first. A plain
 * array reversal would also move the start to the last point.
 *
 * @param points `[x0, y0, z0, x1, y1, z1, ...]`, from a closed `resample`.
 * @returns A new array; `points` is untouched.
 */
export const reverse = (points: Float32Array): Float32Array => {
  const reversed = new Float32Array(points.length);
  const vertexCount = points.length / 3;

  for (let i = 0; i < vertexCount; i++) {
    const sourceVertex = wrap(vertexCount - i, vertexCount);
    reversed[i * 3] = points[sourceVertex * 3];
    reversed[i * 3 + 1] = points[sourceVertex * 3 + 1];
    reversed[i * 3 + 2] = points[sourceVertex * 3 + 2];
  }

  return reversed;
};

/** Sum of the distances between matching points: what `align` minimises. */
const totalDistance = (a: Float32Array, b: Float32Array) => {
  let total = 0;
  for (let i = 0; i < a.length; i += 3) {
    total += Math.sqrt(
      (a[i] - b[i]) ** 2 +
        (a[i + 1] - b[i + 1]) ** 2 +
        (a[i + 2] - b[i + 2]) ** 2,
    );
  }
  return total;
};

/**
 * Reorders the closed curve `a` so that its points line up with `b`'s: tries
 * every start index, in both directions, and keeps the one with the smallest
 * total distance between matching points. Morphing from the result to `b`
 * then neither twists nor flips.
 *
 * Both must come from `resample(..., { closed: true })` with the same count:
 * a closed sample's last point does not repeat its first, so any rotation of
 * the start index keeps the spacing even.
 *
 * @param a Points to reorder, `[x0, y0, z0, x1, y1, z1, ...]`.
 * @param b Points to line up with, the same length as `a`.
 * @returns A new array with `a`'s points in the new order; `a` is untouched.
 */
export const align = (a: Float32Array, b: Float32Array): Float32Array => {
  if (a.length !== b.length) {
    throw new RangeError("align: arrays must be the same length");
  }

  let result = rotateStart(a, 0);
  let bestDistance = totalDistance(result, b);

  const vertexCount = a.length / 3;
  const candidates = [a, reverse(a)];
  for (const candidate of candidates) {
    for (let start = 0; start < vertexCount; start += 1) {
      const rotated = rotateStart(candidate, start);
      const distance = totalDistance(rotated, b);
      if (distance < bestDistance) {
        bestDistance = distance;
        result = rotated;
      }
    }
  }

  return result;
};
