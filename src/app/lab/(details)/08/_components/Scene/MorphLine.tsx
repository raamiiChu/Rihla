import { useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import {
  type BufferGeometry,
  Color,
  type LineBasicMaterial,
  MathUtils,
  type PointsMaterial,
} from "three";
import { align, reverse, rotateStart } from "@/lib/morph/align";
import { CLOUD_OFFSETS } from "../../_data/cloud";
import {
  CLOUD_POINT_COLOR,
  FIRST_TIP_COLOR,
  SOURCE_LINE_COLOR,
  TIP_COLOR,
} from "../../_data/color";
import { POINT_COUNT, SHAPES, STAR_TIP_INDICES } from "../../_data/shapes";

/**
 * One colour per tip marker, fixed: the first tip stands out, so a twist
 * shows as it travelling round. `Color` converts the sRGB hex to the linear
 * values vertex colours expect.
 */
const TIP_COLORS = new Float32Array(
  STAR_TIP_INDICES.flatMap((_, tip) =>
    new Color(tip === 0 ? FIRST_TIP_COLOR : TIP_COLOR).toArray(),
  ),
);

const CLOUD_PROGRESS = 0.5;

/**
 * How far the points have scattered (0 on a shape, 1 in the cloud) by the time
 * the line has fully faded out and the points fully in. Kept low so the hand-off
 * is over before the scattered points, joined in order, turn the line into a
 * tangle.
 */
const FADE_END = 0.3;

type MorphLineProps = {
  startOffset: number;
  reversed: boolean;
  aligned: boolean;
  morphProgressRef: RefObject<number>;
};

const MorphLine = ({
  startOffset,
  reversed,
  aligned,
  morphProgressRef,
}: MorphLineProps) => {
  const lineGeometryRef = useRef<BufferGeometry>(null);
  const cloudGeometryRef = useRef<BufferGeometry>(null);
  const lineMaterialRef = useRef<LineBasicMaterial>(null);
  const cloudMaterialRef = useRef<PointsMaterial>(null);

  const tipGeometryRef = useRef<BufferGeometry>(null);
  const tipPositions = useMemo(
    () => new Float32Array(STAR_TIP_INDICES.length * 3),
    [],
  );

  const output = useMemo(() => new Float32Array(POINT_COUNT * 3), []);

  const circlePoints = useMemo(() => {
    const points = rotateStart(
      SHAPES.CIRCLE,
      Math.round(startOffset * POINT_COUNT),
    );

    const shuffled = reversed ? reverse(points) : points;

    // Once at set-up, never per frame: align tries 2 × POINT_COUNT
    // candidates. Whatever the offset and direction, it should land on the
    // same order.
    return aligned ? align(shuffled, SHAPES.STAR) : shuffled;
  }, [startOffset, reversed, aligned]);

  // Each point scatters around the midpoint of its own path, so the cloud
  // still hints at where the line came from and where it is going.
  const cloudPoints = useMemo(() => {
    const points = new Float32Array(POINT_COUNT * 3);

    for (let i = 0; i < points.length; i++) {
      points[i] =
        MathUtils.lerp(circlePoints[i], SHAPES.STAR[i], 0.5) + CLOUD_OFFSETS[i];
    }
    return points;
  }, [circlePoints]);

  useFrame(() => {
    const progress = morphProgressRef.current;
    const isScattering = progress < CLOUD_PROGRESS;

    let min: number;
    let max: number;
    let from: Float32Array;
    let to: Float32Array;

    if (isScattering) {
      min = 0;
      max = CLOUD_PROGRESS;
      from = circlePoints;
      to = cloudPoints;
    } else {
      min = CLOUD_PROGRESS;
      max = 1;
      from = cloudPoints;
      to = SHAPES.STAR;
    }

    const easedProgress = MathUtils.smoothstep(progress, min, max);

    const scatter = isScattering ? easedProgress : 1 - easedProgress;
    const cloudWeight = MathUtils.smoothstep(scatter, 0, FADE_END);

    for (let i = 0; i < output.length; i++) {
      output[i] = MathUtils.lerp(from[i], to[i], easedProgress);
    }

    if (lineGeometryRef.current) {
      lineGeometryRef.current.attributes.position.needsUpdate = true;
    }

    if (cloudGeometryRef.current) {
      cloudGeometryRef.current.attributes.position.needsUpdate = true;
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 1 - cloudWeight;
    }

    if (cloudMaterialRef.current) {
      cloudMaterialRef.current.opacity = cloudWeight;
    }

    // Follow the samples that end on the star's tips: copy each one's place
    // in this frame's morph into the markers' own buffer.
    STAR_TIP_INDICES.forEach((sample, tip) => {
      tipPositions.set(output.subarray(sample * 3, sample * 3 + 3), tip * 3);
    });
    if (tipGeometryRef.current) {
      tipGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <lineLoop frustumCulled={false}>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[output, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterialRef}
          transparent
          color={SOURCE_LINE_COLOR}
        />
      </lineLoop>

      <points frustumCulled={false}>
        <bufferGeometry ref={cloudGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[output, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={cloudMaterialRef}
          transparent
          color={CLOUD_POINT_COLOR}
          size={2}
          sizeAttenuation={false}
        />
      </points>

      {/* Drawn after the line, so the markers sit on top of it. */}
      <points frustumCulled={false} renderOrder={1}>
        <bufferGeometry ref={tipGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[tipPositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[TIP_COLORS, 3]} />
        </bufferGeometry>
        <pointsMaterial vertexColors size={8} sizeAttenuation={false} />
      </points>
    </>
  );
};

export default MorphLine;
