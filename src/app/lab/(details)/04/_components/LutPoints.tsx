import { useMemo } from "react";
import { type CatmullRomCurve3, Vector3 } from "three";
import { OFFSET, type RailLUT, STRIDE } from "../_utils/rail";

const POSITION_SIZE = 3;

// The LUT's positions alone, packed for a position attribute.
const readPositions = (lut: RailLUT) => {
  const positions = new Float32Array(lut.samples * POSITION_SIZE);
  const temp = new Vector3();
  for (let i = 0; i < lut.samples; i++) {
    temp.fromArray(lut.data, i * STRIDE + OFFSET.position);
    temp.toArray(positions, i * POSITION_SIZE);
  }
  return positions;
};

const DebugPoints = ({
  positions,
  color,
}: {
  positions: Float32Array;
  color: string;
}) => {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, POSITION_SIZE]}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={5} sizeAttenuation={false} />
    </points>
  );
};

type LutPointsProps = {
  curve: CatmullRomCurve3;
  debugLut: RailLUT;
};

const LutPoints = ({ curve, debugLut }: LutPointsProps) => {
  const arcLengthPositions = useMemo(() => readPositions(debugLut), [debugLut]);

  const parameterPositions = useMemo(
    () =>
      new Float32Array(
        curve
          .getPoints(debugLut.samples - 1)
          .flatMap((point) => point.toArray()),
      ),
    [curve, debugLut],
  );

  return (
    <>
      <DebugPoints positions={arcLengthPositions} color="green" />
      <DebugPoints positions={parameterPositions} color="red" />
    </>
  );
};

export default LutPoints;
