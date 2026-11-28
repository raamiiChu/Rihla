const START_ANGLE = Math.PI / 2; // 90 degrees (0, 1, 0)

/**
 * Euclid's algorithm: the greatest common divisor of a and b.
 */
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

/**
 * The star polygon {n/k}: n points evenly spaced round a circle of radius 1 on
 * the z = 0 plane, joined by stepping k points at a time. When n and k share
 * no factor, one stroke visits every point before returning to the first.
 *
 * The result is a polyline, `[x0, y0, z0, x1, y1, z1, ...]`, ready for
 * `resample(..., { closed: true })`:
 *
 * - n vertices; the last does not repeat the first, as `resample` adds the
 *   closing segment itself.
 * - Circle point 0 is at the top, (0, 1, 0), and the points count
 *   anticlockwise; vertex i sits on circle point (i × k) mod n.
 * - `{n/k}` and `{n/(n − k)}` draw the same shape in opposite directions.
 *
 * @throws {RangeError} When n < 3, k is outside 1 to n − 1, or n and k share
 * a factor (the star would not be one stroke).
 */
export const starPolygon = (n: number, k: number): Float32Array => {
  if (n < 3) {
    throw new RangeError("starPolygon: n must be at least 3");
  }

  if (k < 1 || k >= n) {
    throw new RangeError("starPolygon: k must be between 1 and n-1");
  }

  if (gcd(n, k) !== 1) {
    throw new RangeError("starPolygon: n and k must not share a factor");
  }

  const points = new Float32Array(n * 3);
  const stepAngle = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const circlePoint = (i * k) % n;
    const angle = circlePoint * stepAngle + START_ANGLE;

    points[i * 3] = Math.cos(angle);
    points[i * 3 + 1] = Math.sin(angle);
    points[i * 3 + 2] = 0;
  }

  return points;
};
