type PointCloudProps = {
  positions: Float32Array;
  color: string;
  /** In pixels: `sizeAttenuation` is off, so points keep their size. */
  size: number;
  /** All layers sit at z = 0, so draw order decides which is on top. */
  renderOrder: number;
};

const PointCloud = ({
  positions,
  color,
  size,
  renderOrder,
}: PointCloudProps) => {
  return (
    <points renderOrder={renderOrder}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation={false} />
    </points>
  );
};

export default PointCloud;
