import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  buildRailLUT,
  createCameraState,
  getCameraState,
  OFFSET,
  RAIL_SAMPLES,
  type RailLUT,
  STRIDE,
} from "./rail";

// A straight rail along the x axis, 3 units long, so every expected value can
// be worked out by hand. Note that sample i is placed by arc length, so it does
// not line up with control point i.
const POINTS = [
  new Vector3(0, 0, 0),
  new Vector3(1, 0, 0),
  new Vector3(2, 0, 0),
  new Vector3(3, 0, 0),
];
const CURVE = new CatmullRomCurve3(POINTS);
const SAMPLES = 3;
const SAMPLE_INDICES = Array.from({ length: SAMPLES }, (_, i) => i);

// Float32Array keeps about 7 significant digits, and getPointAt goes through
// an approximate arc-length lookup, so positions are compared by distance.
const TOLERANCE = 1e-5;

const WORLD_UP = new Vector3(0, 1, 0);

const read = (lut: RailLUT, i: number, field: keyof typeof OFFSET) => {
  return new Vector3().fromArray(lut.data, i * STRIDE + OFFSET[field]);
};

describe("buildRailLUT with 3 samples on a straight rail", () => {
  const railLUT = buildRailLUT(CURVE, SAMPLES);

  it("stores STRIDE floats per sample", () => {
    expect(railLUT.data.length).toBe(SAMPLES * STRIDE);
  });

  it("places sample 0 at the start of the curve", () => {
    const position = read(railLUT, 0, "position");
    expect(position.distanceTo(CURVE.getPointAt(0))).toBeLessThan(TOLERANCE);
  });

  it("places sample 1 at the arc-length midpoint, not at control point 1", () => {
    const position = read(railLUT, 1, "position");
    expect(position.distanceTo(new Vector3(1.5, 0, 0))).toBeLessThan(TOLERANCE);
  });

  it("places the last sample at the end of the curve", () => {
    const position = read(railLUT, SAMPLES - 1, "position");
    expect(position.distanceTo(new Vector3(3, 0, 0))).toBeLessThan(TOLERANCE);
  });

  it("stores the world up vector for sample 2", () => {
    const up = read(railLUT, 2, "up");
    expect(up.distanceTo(WORLD_UP)).toBeLessThan(TOLERANCE);
  });

  // One test per sample, so a failure names the sample that broke.
  it.each(SAMPLE_INDICES)("stores a +x unit tangent for sample %i", (i) => {
    const tangent = read(railLUT, i, "tangent");
    expect(tangent.distanceTo(new Vector3(1, 0, 0))).toBeLessThan(TOLERANCE);
  });

  it.each(SAMPLE_INDICES.slice(0, -1))(
    "spaces sample %i and the next one 1.5 apart",
    (i) => {
      const current = read(railLUT, i, "position");
      const next = read(railLUT, i + 1, "position");
      expect(current.distanceTo(next)).toBeCloseTo(1.5, 5);
    },
  );
});

// Control points 1 and 9 units apart. Evenly spaced points (as in CURVE) give
// the same result for getPoint and getPointAt, so they cannot tell the two
// apart; uneven spacing can. getPoint(0.5) lands on control point 1 at x = 1,
// while the arc-length midpoint of this 10-unit rail is at x = 5.
const UNEVEN_CURVE = new CatmullRomCurve3([
  new Vector3(0, 0, 0),
  new Vector3(1, 0, 0),
  new Vector3(10, 0, 0),
]);
// The default of 200 leaves getPointAt about 5e-5 off, above TOLERANCE.
UNEVEN_CURVE.arcLengthDivisions = 1000;

describe("buildRailLUT on unevenly spaced control points", () => {
  it("places samples by arc length, not by curve parameter", () => {
    const railLUT = buildRailLUT(UNEVEN_CURVE, 3);
    const position = read(railLUT, 1, "position");
    expect(position.distanceTo(new Vector3(5, 0, 0))).toBeLessThan(TOLERANCE);
  });
});

describe("buildRailLUT input validation", () => {
  it("throws when given fewer than 2 samples", () => {
    expect(() => buildRailLUT(CURVE, 1)).toThrow();
  });
});

describe("getCameraState with 3 samples on a straight rail", () => {
  const railLUT = buildRailLUT(CURVE, SAMPLES);

  // With 3 samples, progress p maps to x = p * 2 in sample space, and the rail
  // is 3 units long, so the expected x position is simply p * 3.
  it.each([
    { progress: 0, expectedX: 0, note: "on sample 0" },
    { progress: 0.25, expectedX: 0.75, note: "halfway between sample 0 and 1" },
    { progress: 0.5, expectedX: 1.5, note: "on sample 1" },
    { progress: 0.75, expectedX: 2.25, note: "halfway between sample 1 and 2" },
    { progress: 1, expectedX: 3, note: "on the last sample" },
  ])(
    "places the camera at x = $expectedX at progress $progress ($note)",
    ({ progress, expectedX }) => {
      const cameraState = getCameraState(
        progress,
        railLUT,
        createCameraState(),
      );
      expect(
        cameraState.position.distanceTo(new Vector3(expectedX, 0, 0)),
      ).toBeLessThan(TOLERANCE);
    },
  );

  it.each([
    { progress: -0.5, expectedX: 0, end: "start" },
    { progress: 1.5, expectedX: 3, end: "end" },
  ])(
    "clamps progress $progress to the $end of the curve",
    ({ progress, expectedX }) => {
      const cameraState = getCameraState(
        progress,
        railLUT,
        createCameraState(),
      );
      expect(
        cameraState.position.distanceTo(new Vector3(expectedX, 0, 0)),
      ).toBeLessThan(TOLERANCE);
    },
  );

  it("writes into and returns the out object instead of allocating", () => {
    const out = createCameraState();
    const { position, quaternion } = out;

    const result = getCameraState(0.5, railLUT, out);

    expect(result).toBe(out);
    expect(result.position).toBe(position);
    expect(result.quaternion).toBe(quaternion);
  });

  it("gives the same result when the out object is reused", () => {
    const out = createCameraState();
    getCameraState(0.9, railLUT, out);
    getCameraState(0.25, railLUT, out);

    expect(out.position.distanceTo(new Vector3(0.75, 0, 0))).toBeLessThan(
      TOLERANCE,
    );
  });

  // A camera looks down its local -Z axis, so on this rail its forward vector
  // should end up along +x. Orientation must not depend on where the camera
  // is, so it is checked at several points along the rail.
  const ORIENTATION_PROGRESSES = [0, 0.25, 0.5, 1];

  it.each(ORIENTATION_PROGRESSES)("faces +x at progress %f", (progress) => {
    const cameraState = getCameraState(progress, railLUT, createCameraState());
    const forward = new Vector3(0, 0, -1).applyQuaternion(
      cameraState.quaternion,
    );
    expect(forward.distanceTo(new Vector3(1, 0, 0))).toBeLessThan(TOLERANCE);
  });

  it.each(ORIENTATION_PROGRESSES)(
    "keeps the camera's up along world +y at progress %f",
    (progress) => {
      const cameraState = getCameraState(
        progress,
        railLUT,
        createCameraState(),
      );
      const up = new Vector3(0, 1, 0).applyQuaternion(cameraState.quaternion);
      expect(up.distanceTo(WORLD_UP)).toBeLessThan(TOLERANCE);
    },
  );
});

// A vertical loop, kept here rather than imported from the lab so that
// experiments there cannot change what these tests check. It climbs, runs
// backwards over the top and comes down again, so its tangent passes close to
// straight up and straight down, where a fixed world up breaks. Its x drifts
// from entry to exit, so the loop is not planar: transport alone leaves it
// rolled by about 41 degrees, which the levelling tests rely on.
const LOOP_CURVE = new CatmullRomCurve3([
  new Vector3(1, 0, 0),
  new Vector3(-5, 2, -45),
  new Vector3(-3, 20, -45),
  new Vector3(-1, 20, -10),
  new Vector3(5, 2, -10),
  new Vector3(1, 0, -60),
]);
LOOP_CURVE.arcLengthDivisions = 1000;
describe("orientation on a vertical loop", () => {
  const railLUT = buildRailLUT(LOOP_CURVE);

  // Float32Array rounding alone stays far below this.
  const PERPENDICULAR_TOLERANCE = 1e-4;

  it("stores an up vector perpendicular to the tangent at every sample", () => {
    const misaligned: number[] = [];
    for (let i = 0; i < railLUT.samples; i++) {
      const tangent = read(railLUT, i, "tangent");
      const up = read(railLUT, i, "up");
      if (Math.abs(tangent.dot(up)) > PERPENDICULAR_TOLERANCE) {
        misaligned.push(i);
      }
    }

    expect(
      misaligned.length,
      `${misaligned.length} of ${railLUT.samples} samples, first: ${misaligned.slice(0, 5).join(", ")}`,
    ).toBe(0);
  });

  // The loop drifts along x, so the tangent never points exactly up. A fixed
  // up then does not snap round in one step: it spins quickly over a short
  // stretch of rail, and a per-step "did up reverse?" check misses it.
  //
  // What parallel transport guarantees instead: from one step to the next, the
  // camera's up turns by no more than its forward does. A fixed up near the
  // vertical turns far more than the forward (the spin). The slack only
  // absorbs the lerp between LUT samples; parallel transport measures about
  // 1e-7 rad, the fixed up about 0.19 rad.
  //
  // Levelling turns the up round the tangent on purpose, so this property only
  // holds for transport alone: the LUT is built with levelling switched off.
  const STEPS = 200;
  const ANGLE_SLACK = 1e-3;
  const transportOnlyLUT = buildRailLUT(LOOP_CURVE, RAIL_SAMPLES, {
    levellingRate: 0,
  });

  it("never turns the camera's up more than its forward without levelling", () => {
    const cameraState = createCameraState();
    const previousUp = new Vector3();
    const currentUp = new Vector3();
    const previousForward = new Vector3();
    const currentForward = new Vector3();
    const spins: number[] = [];

    for (let step = 0; step <= STEPS; step++) {
      const progress = step / STEPS;
      getCameraState(progress, transportOnlyLUT, cameraState);
      currentUp.set(0, 1, 0).applyQuaternion(cameraState.quaternion);
      currentForward.set(0, 0, -1).applyQuaternion(cameraState.quaternion);

      if (step > 0) {
        const upTurn = previousUp.angleTo(currentUp);
        const forwardTurn = previousForward.angleTo(currentForward);
        if (upTurn > forwardTurn + ANGLE_SLACK) {
          spins.push(progress);
        }
      }
      previousUp.copy(currentUp);
      previousForward.copy(currentForward);
    }

    expect(spins).toEqual([]);
  });
});

// Parallel transport never flips, but it does not return the up to the sky
// either: LOOP_CURVE twists in space, so transport alone leaves the camera
// rolled by about 41 degrees once the loop is behind it. Levelling pulls the up
// back towards the world up along level stretches of rail.
describe("levelling on a vertical loop", () => {
  // The most upright direction available at a sample: the world up with its
  // component along the tangent removed.
  const levelUp = (tangent: Vector3) => {
    return WORLD_UP.clone()
      .addScaledVector(tangent, -WORLD_UP.dot(tangent))
      .normalize();
  };

  const lastUp = (lut: RailLUT) => read(lut, lut.samples - 1, "up");

  it("levels the camera again on the straight run after the loop", () => {
    const railLUT = buildRailLUT(LOOP_CURVE);
    const lastTangent = read(railLUT, railLUT.samples - 1, "tangent");

    const tilt = lastUp(railLUT).angleTo(levelUp(lastTangent));
    expect(MathUtils.radToDeg(tilt)).toBeLessThan(2);
  });

  // The levelling rate is per unit of arc length, not per sample. A rate per
  // sample would level 4 times as fast with 4 times the samples, so the two
  // LUTs below would leave the loop at different angles.
  it("levels by distance travelled, whatever the number of samples", () => {
    const dense = buildRailLUT(LOOP_CURVE, 1024);
    const sparse = buildRailLUT(LOOP_CURVE, 256);

    const difference = lastUp(dense).angleTo(lastUp(sparse));
    expect(MathUtils.radToDeg(difference)).toBeLessThan(1);
  });

  // Over the top of the loop the tangent is level again, but the camera is
  // upside down. Levelling there would roll it the right way up mid-loop,
  // which is the flip all over again, so it must wait until the camera is
  // roughly upright.
  it("keeps the camera upside down over the top of the loop", () => {
    const railLUT = buildRailLUT(LOOP_CURVE);

    let top = 0;
    for (let i = 1; i < railLUT.samples; i++) {
      if (read(railLUT, i, "position").y > read(railLUT, top, "position").y) {
        top = i;
      }
    }

    expect(read(railLUT, top, "up").y).toBeLessThan(-0.9);
  });
});
