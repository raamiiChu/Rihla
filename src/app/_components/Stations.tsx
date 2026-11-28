"use client";

import { STATION_RANGES } from "@/data/timeline";
import { useScrollStore } from "@/stores/scroll";

const Stations = () => {
  const stationIndex = useScrollStore((state) => state.stationIndex);
  const stationId = STATION_RANGES[stationIndex].id;

  return (
    <ol>
      {STATION_RANGES.map((station) => (
        <li
          key={station.id}
          className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center"
        >
          {/* <p className="text-sm tracking-widest text-gold">
          {t(`stops.${id}.year`)}
        </p>
        <h2 className="text-3xl">{t(`stops.${id}.name`)}</h2>
        <p className="max-w-prose text-muted-foreground">
          {t.rich(`stops.${id}.line`, { i: italic })}
        </p> */}
          {station.id}
        </li>
      ))}
    </ol>
  );
};

export default Stations;
