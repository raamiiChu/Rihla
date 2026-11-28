import { STOPS } from "@/data/stops";
import { STATION_WEIGHTS } from "@/data/timeline";
import { useScrollStore } from "@/stores/scroll";

const StationBackground = () => {
  const stationIndex = useScrollStore((state) => state.stationIndex);
  const stationId = STATION_WEIGHTS[stationIndex].id;
  const bgColour = STOPS[stationId].palette.background;

  return <color attach="background" args={[bgColour]} />;
};

export default StationBackground;
