import { CatmullRomCurve3, Vector3 } from "three";

const createRailCurve = (points: Vector3[]) => {
  const curve = new CatmullRomCurve3(points);
  curve.arcLengthDivisions = 1000;
  return curve;
};

export const WAVE_CURVE = createRailCurve([
  new Vector3(1, 0, 0),
  new Vector3(-2, 2, -5),
  new Vector3(2, -4, -14),
  new Vector3(0, 3, -25),
  new Vector3(2, 5, -29),
  new Vector3(-1, 3, -42),
  new Vector3(-2, 2, -45),
  new Vector3(0, 5, -60),
]);

export const LOOP_CURVE = createRailCurve([
  new Vector3(1, 0, 0),
  new Vector3(-5, 2, -45),
  new Vector3(-3, 20, -45),
  new Vector3(-1, 20, -10),
  new Vector3(5, 2, -10),
  new Vector3(1, 0, -60),
]);
