/**
 * A deliberately uneven polyline on the z = 0 plane: a tight cluster of
 * vertices on the left, one long edge across the middle, and a sharp corner
 * on the right. Resampling should spread the points evenly regardless.
 */
// biome-ignore format: one vertex per line
const SOURCE = new Float32Array([
  // A tight cluster: seven vertices within half a unit.
  -3, -1.5, 0,
  -2.95, -1.35, 0,
  -2.9, -1.2, 0,
  -2.85, -1.05, 0,
  -2.78, -0.9, 0,
  -2.7, -0.75, 0,
  -2.6, -0.6, 0,
  // One long edge up to the right.
  2.4, 1.5, 0,
  // A sharp corner, folding back down.
  1.6, -1.5, 0,
  2.3, -1.6, 0,
  3, -1.1, 0,
]);

/** The polyline's extent, used to fit it to the canvas. */
const SOURCE_BOUNDS = { width: 6, height: 3.1 } as const;

export { SOURCE, SOURCE_BOUNDS };
