import { create } from "zustand";
import { STATION_RANGES } from "@/data/timeline";
import { getStationIndex } from "@/lib/timeline/stations";

type ScrollState = {
  isSynced: boolean;
  progress: number;
  stationIndex: number;
  setProgress: (progress: number) => void;
};

export const useScrollStore = create<ScrollState>()((set) => ({
  isSynced: false,
  progress: 0,
  stationIndex: 0,
  setProgress: (progress) =>
    set({
      isSynced: true,
      progress,
      stationIndex: getStationIndex(progress, STATION_RANGES),
    }),
}));
