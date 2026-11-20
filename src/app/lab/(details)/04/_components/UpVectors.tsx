import { useMemo } from "react";
import { Vector3 } from "three";
import { OFFSET, type RailLUT, STRIDE } from "@/lib/camera/rail";

const POINTS_PER_SEGMENT = 2;
const POSITION_SIZE = 3;
const LINE_SEGMENT_LENGTH = 5;

// One segment per sample, from its position out along its up vector.
const buildUpSegments = (lut: RailLUT) => {
  const positions = new Float32Array(
    lut.samples * POSITION_SIZE * POINTS_PER_SEGMENT,
  );

  const tempPosition = new Vector3();
  const tempUp = new Vector3();
  for (let i = 0; i < lut.samples; i++) {
    tempPosition.fromArray(lut.data, i * STRIDE + OFFSET.position);
    tempPosition.toArray(
      positions,
      (i * POINTS_PER_SEGMENT + 0) * POSITION_SIZE,
    );

    tempUp.fromArray(lut.data, i * STRIDE + OFFSET.up);
    tempPosition.addScaledVector(tempUp, LINE_SEGMENT_LENGTH);
    tempPosition.toArray(
      positions,
      (i * POINTS_PER_SEGMENT + 1) * POSITION_SIZE,
    );
  }

  return positions;
};

type UpVectorsProps = {
  debugLut: RailLUT;
};

const UpVectors = ({ debugLut }: UpVectorsProps) => {
  const positions = useMemo(() => buildUpSegments(debugLut), [debugLut]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, POSITION_SIZE]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="cyan" />
    </lineSegments>
  );
};

export default UpVectors;
