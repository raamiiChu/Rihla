/**
 * Centres a shape on the origin and scales it to fit the unit sphere, so
 * shapes from any source (fontkit's font units, a unit-circle star) share one
 * frame before `align` compares them.
 *
 * - Centre: the middle of the bounding box, not the mean of the points, so
 *   a densely sampled stroke on one side does not pull it off.
 * - Scale: one factor for all three axes, chosen so the farthest point ends
 *   up exactly 1 from the origin. The proportions are kept.
 * - When every point coincides there is nothing to scale: the points are
 *   only centred, all at the origin, rather than divided by 0 into NaN.
 *
 * @param points `[x0, y0, z0, x1, y1, z1, ...]`, at least one point.
 * @returns A new array; `points` is untouched.
 * @throws {RangeError} When `points` is empty.
 */
export const normalize = (points: Float32Array): Float32Array => {
  if (points.length === 0) {
    throw new RangeError("normalize: points should not be an empty array");
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < points.length; i++) {
    const axis = i % 3;
    min[axis] = Math.min(min[axis], points[i]);
    max[axis] = Math.max(max[axis], points[i]);
  }

  const centre = [0, 1, 2].map((axis) => {
    return (max[axis] + min[axis]) / 2;
  });

  let farthestSquared = 0;
  for (let i = 0; i < points.length; i += 3) {
    farthestSquared = Math.max(
      farthestSquared,
      (points[i] - centre[0]) ** 2 +
        (points[i + 1] - centre[1]) ** 2 +
        (points[i + 2] - centre[2]) ** 2,
    );
  }

  const scale = farthestSquared === 0 ? 1 : 1 / Math.sqrt(farthestSquared);
  const normalized = new Float32Array(points.length);
  for (let i = 0; i < points.length; i++) {
    normalized[i] = (points[i] - centre[i % 3]) * scale;
  }
  return normalized;
};
