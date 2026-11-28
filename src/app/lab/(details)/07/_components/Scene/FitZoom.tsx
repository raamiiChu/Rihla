import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { SOURCE_BOUNDS } from "../../_data/polyline";

// Leave room around the shape, and for the buttons along the top.
const FILL = 0.8;

/**
 * Sets the orthographic camera's zoom (pixels per world unit) so the polyline
 * fills the pane at any width, including a phone's.
 */
const FitZoom = () => {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    camera.zoom =
      Math.min(width / SOURCE_BOUNDS.width, height / SOURCE_BOUNDS.height) *
      FILL;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
};

export default FitZoom;
