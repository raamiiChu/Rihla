import {
  buildStationRanges,
  type StationWeights,
} from "@/lib/timeline/stations";

export const STATION_WEIGHTS = [
  {
    id: "tangier",
    flight: 0,
    dwell: 10,
  },
  {
    id: "mecca",
    flight: 3,
    dwell: 5,
  },
  {
    id: "samarkand",
    flight: 5,
    dwell: 10,
  },
] as const satisfies readonly StationWeights[];

export const STATION_RANGES = buildStationRanges(STATION_WEIGHTS);

export type StationId = (typeof STATION_WEIGHTS)[number]["id"];
