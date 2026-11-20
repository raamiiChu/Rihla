import { type Curve, MathUtils, Matrix4, Quaternion, Vector3 } from "three";

export type RailLUT = {
  samples: number;
  data: Float32Array; // length = sample * STRIDE
};

export const STRIDE = 9; // 3 x Vector3
export const RAIL_SAMPLES = 1024;

const WORLD_UP = new Vector3(0, 1, 0);
const LEVELLING_RATE = 0.1;

// |tangent · world up| below this levels at full strength, above the next
// one not at all.
const LEVEL_FULL_BELOW = 0.5; // about 30 degrees of slope
const LEVEL_NONE_ABOVE = 0.8; // about 53 degrees

// up · target at or below this does not level, at or above the next one
// levels at full strength.
const UPRIGHT_NONE_BELOW = 0; // 90 degrees of roll or more
const UPRIGHT_FULL_ABOVE = 0.5; // 60 degrees of roll or less

export const OFFSET = {
  position: 0,
  tangent: 3,
  up: 6,
} as const;

export type CameraState = {
  position: Vector3;
  quaternion: Quaternion;
};

const makePerpendicular = (vector: Vector3, unitDirection: Vector3) => {
  const length = vector.dot(unitDirection);
  return vector.addScaledVector(unitDirection, -length).normalize();
};

export const buildRailLUT = (
  curve: Curve<Vector3>,
  samples = RAIL_SAMPLES,
  { levellingRate = LEVELLING_RATE } = {},
): RailLUT => {
  if (samples < 2) {
    throw new Error("samples must be at least 2");
  }

  const stepLength = curve.getLength() / (samples - 1);
  const levellingPerStep = 1 - Math.exp(-levellingRate * stepLength);

  const data = new Float32Array(samples * STRIDE);
  const point = new Vector3();
  const tangent = new Vector3();
  const up = WORLD_UP.clone();
  const prevTangent = new Vector3();
  const rotation = new Quaternion();
  const target = new Vector3();

  for (let i = 0; i < samples; i++) {
    const u = i / (samples - 1); // arc-length ratio
    curve.getPointAt(u, point);
    curve.getTangentAt(u, tangent);

    if (i > 0) {
      rotation.setFromUnitVectors(prevTangent, tangent);
      up.applyQuaternion(rotation);
    }

    makePerpendicular(up, tangent);

    // Level less the steeper the rail, and not at all near the vertical.
    const verticalGate =
      1 -
      MathUtils.smoothstep(
        Math.abs(tangent.dot(WORLD_UP)),
        LEVEL_FULL_BELOW,
        LEVEL_NONE_ABOVE,
      );

    if (verticalGate > 0) {
      // The most upright direction available here.
      makePerpendicular(target.copy(WORLD_UP), tangent);

      // Only level a camera that is roughly upright already.
      const uprightGate = MathUtils.smoothstep(
        up.dot(target),
        UPRIGHT_NONE_BELOW,
        UPRIGHT_FULL_ABOVE,
      );

      const weight = verticalGate * uprightGate * levellingPerStep;

      if (weight > 0) {
        up.lerp(target, weight).normalize();
      }
    }

    point.toArray(data, i * STRIDE + OFFSET.position);
    tangent.toArray(data, i * STRIDE + OFFSET.tangent);
    up.toArray(data, i * STRIDE + OFFSET.up);

    prevTangent.copy(tangent);
  }

  return { samples, data };
};

export const createCameraState = (): CameraState => {
  return {
    position: new Vector3(),
    quaternion: new Quaternion(),
  };
};

const _position0 = new Vector3();
const _position1 = new Vector3();
const _tangent0 = new Vector3();
const _tangent1 = new Vector3();
const _lerpedTangent = new Vector3();
const _up0 = new Vector3();
const _up1 = new Vector3();
const _lerpedUp = new Vector3();
const _target = new Vector3();
const _matrix4 = new Matrix4();

const readVec3 = (
  lut: RailLUT,
  index: number,
  field: keyof typeof OFFSET,
  vec: Vector3,
) => {
  vec.fromArray(lut.data, index * STRIDE + OFFSET[field]);
  return vec;
};

export const getCameraState = (
  progress: number,
  lut: RailLUT,
  out: CameraState,
): CameraState => {
  const clampedProgress = MathUtils.clamp(progress, 0, 1);
  const x = clampedProgress * (lut.samples - 1);

  const index = Math.floor(x);
  const fraction = x - index;
  const nextIndex = Math.min(index + 1, lut.samples - 1);

  readVec3(lut, index, "position", _position0);
  readVec3(lut, nextIndex, "position", _position1);

  readVec3(lut, index, "tangent", _tangent0);
  readVec3(lut, nextIndex, "tangent", _tangent1);

  readVec3(lut, index, "up", _up0);
  readVec3(lut, nextIndex, "up", _up1);

  out.position.lerpVectors(_position0, _position1, fraction);

  _lerpedTangent.lerpVectors(_tangent0, _tangent1, fraction).normalize();
  _lerpedUp.lerpVectors(_up0, _up1, fraction).normalize();

  _target.addVectors(out.position, _lerpedTangent);

  _matrix4.lookAt(out.position, _target, _lerpedUp);
  out.quaternion.setFromRotationMatrix(_matrix4);

  return out;
};
