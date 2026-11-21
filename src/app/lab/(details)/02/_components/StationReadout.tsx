"use client";

import { STATION_RANGES } from "@/data/timeline";
import { useScrollStore } from "@/stores/scroll";

const StationReadout = () => {
  const stationIndex = useScrollStore((state) => state.stationIndex);
  const stationId = STATION_RANGES[stationIndex].id;

  console.log("StationReadout rendered", stationIndex);

  return (
    <output
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4"
    >
      <span>{stationId}</span>
      <span>{`stationIndex: ${stationIndex}`}</span>
    </output>
  );
};

export default StationReadout;
