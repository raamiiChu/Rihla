import { Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CANVAS_BG_COLOR } from "@/app/lab/const";
import { ScrollDriverHandoff } from "@/components";
import ControlPoints from "./ControlPoints";
import RailCamera from "./RailCamera";
import RailLine from "./RailLine";
import StationMarkers from "./StationMarkers";

const GRID_Y = -6;
const GRID_CELL_COLOR = "#29292b";
const GRID_SECTION_COLOR = "#50432e";

const Scene = () => {
  return (
    <Canvas>
      <ScrollDriverHandoff />

      <Grid
        position={[0, GRID_Y, 0]}
        infiniteGrid
        fadeDistance={200}
        cellSize={1}
        cellColor={GRID_CELL_COLOR}
        sectionSize={10}
        sectionColor={GRID_SECTION_COLOR}
      />

      <color attach="background" args={[CANVAS_BG_COLOR]} />

      <RailCamera />
      <RailLine />
      <ControlPoints />
      <StationMarkers />
    </Canvas>
  );
};

export default Scene;
