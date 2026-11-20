import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { CANVAS_BG_COLOR } from "@/app/lab/const";
import { ScrollDriverHandoff } from "@/components";
import { Button } from "@/components/ui/button";
import { DEFAULT_RAIL, RAILS, type RailName } from "../_utils/rails";
import ControlPoints from "./ControlPoints";
import LutPoints from "./LutPoints";
import RailCamera from "./RailCamera";
import RailLine from "./RailLine";
import UpVectors from "./UpVectors";

// Up and to the side of the rail's start, so the whole rail recedes into the
// distance instead of running straight across a narrow pane.
const OVERVIEW_POSITION: [number, number, number] = [30, 20, 10];

const GRID_Y = -6;
const GRID_CELL_COLOR = "#29292b";
const GRID_SECTION_COLOR = "#50432e";

type ViewMode = "orbit" | "rail";

const RAIL_LABELS: Record<RailName, string> = {
  loop: "Loop",
  wave: "Wave",
};

const Scene = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("orbit");
  const [railName, setRailName] = useState<RailName>(DEFAULT_RAIL);
  const { curve, debugLut, lut, centre } = RAILS[railName];

  return (
    <div
      className="relative h-full"
      data-lenis-prevent={viewMode === "orbit" ? "true" : undefined}
    >
      <div className="absolute inset-e-4 top-4 z-10 flex gap-2">
        <Button
          onClick={() =>
            setRailName((prev) => (prev === "loop" ? "wave" : "loop"))
          }
        >
          {RAIL_LABELS[railName]}
        </Button>
        <Button
          onClick={() =>
            setViewMode((prev) => (prev === "orbit" ? "rail" : "orbit"))
          }
        >
          {viewMode === "orbit" ? "Orbit" : "Rail"}
        </Button>
      </div>
      <Canvas camera={{ position: OVERVIEW_POSITION }}>
        <ScrollDriverHandoff />

        <color attach="background" args={[CANVAS_BG_COLOR]} />
        <Grid
          position={[0, GRID_Y, 0]}
          infiniteGrid
          fadeDistance={200}
          cellSize={1}
          cellColor={GRID_CELL_COLOR}
          sectionSize={10}
          sectionColor={GRID_SECTION_COLOR}
        />

        {/* Keyed by rail, so switching unmounts the old geometry (R3F disposes
            it) and mounts the new one, instead of updating buffers in place. */}
        <group key={railName}>
          <RailLine curve={curve} />
          <ControlPoints curve={curve} />
          <LutPoints curve={curve} debugLut={debugLut} />
          <UpVectors debugLut={debugLut} />
        </group>

        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>

        {viewMode === "orbit" && <OrbitControls target={centre} />}
        <RailCamera active={viewMode === "rail"} lut={lut} />
      </Canvas>
    </div>
  );
};

export default Scene;
