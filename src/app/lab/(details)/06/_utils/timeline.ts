import {
  buildStationRanges,
  type StationWeights,
} from "@/lib/timeline/stations";

export const DEMO_STATION_WEIGHTS = [
  { id: "tangier", flight: 0, dwell: 10 },
  { id: "mecca", flight: 3, dwell: 5 },
  { id: "samarkand", flight: 5, dwell: 10 },
] as const satisfies readonly StationWeights[];

export type DemoStationId = (typeof DEMO_STATION_WEIGHTS)[number]["id"];

export const DEMO_STATION_RANGES = buildStationRanges(DEMO_STATION_WEIGHTS);
