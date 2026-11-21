import { create } from "zustand";
import { STATION_RANGES } from "@/data/timeline";
import { getStationIndex } from "@/lib/timeline/stations";

type ScrollState = {
  progress: number;
  stationIndex: number;
  setProgress: (progress: number) => void;
};

export const useScrollStore = create<ScrollState>()((set) => ({
  progress: 0,
  stationIndex: 0,
  setProgress: (progress) =>
    set({
      progress,
      stationIndex: getStationIndex(progress, STATION_RANGES),
    }),
}));
