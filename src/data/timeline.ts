import {
  buildStationRanges,
  type StationWeights,
} from "@/lib/timeline/stations";

/**
 * The journey in order, and each station's share of the scroll. The only
 * place the order is written: everything else looks stations up by id.
 *
 * The weights are placeholders until the scenes exist. The first and last
 * dwells run longer, since they carry the prologue and the closing summary.
 */
export const STATION_WEIGHTS = [
  { id: "tangier", flight: 0, dwell: 10 },
  { id: "mecca", flight: 5, dwell: 5 },
  { id: "samarkand", flight: 5, dwell: 5 },
  { id: "delhi", flight: 5, dwell: 5 },
  { id: "maldives", flight: 5, dwell: 5 },
  { id: "quanzhou", flight: 5, dwell: 5 },
  { id: "timbuktu", flight: 5, dwell: 5 },
  { id: "fez", flight: 5, dwell: 10 },
] as const satisfies readonly StationWeights[];

export const STATION_RANGES = buildStationRanges(STATION_WEIGHTS);

export type StationId = (typeof STATION_WEIGHTS)[number]["id"];
