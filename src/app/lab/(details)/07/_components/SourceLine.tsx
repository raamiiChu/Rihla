import { extend } from "@react-three/fiber";
import { Line } from "three";
import { SOURCE_LINE_COLOR } from "../_data/colors";

// `<line>` is taken by SVG, so register three's Line under another name.
// `<lineLoop>` has no clash and needs no `extend`.
extend({ ThreeLine: Line });

type SourceLineProps = {
  positions: Float32Array;
  closed: boolean;
};

/** The source polyline; a closed one is drawn back to its first vertex. */
const SourceLine = ({ positions, closed }: SourceLineProps) => {
  const children = (
    <>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={SOURCE_LINE_COLOR} />
    </>
  );

  return closed ? (
    <lineLoop>{children}</lineLoop>
  ) : (
    <threeLine>{children}</threeLine>
  );
};

export default SourceLine;
