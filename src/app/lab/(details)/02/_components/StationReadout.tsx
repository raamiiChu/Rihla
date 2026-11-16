"use client";

import { useScrollStore } from "@/stores/scroll";

const STATIONS = ["丹吉爾", "麥加", "撒馬爾罕"];

const StationReadout = () => {
  const stationIndex = useScrollStore((state) => state.stationIndex);

  console.log("StationReadout rendered", stationIndex);

  return (
    <output
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4"
    >
      <span>{STATIONS[stationIndex]}</span>
      <span>{`stationIndex: ${stationIndex}`}</span>
    </output>
  );
};

export default StationReadout;
