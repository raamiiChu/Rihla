import { create } from "zustand";

type ScrollState = {
  progress: number;
  stationIndex: number;
  setProgress: (progress: number) => void;
};

const STATION_BOUNDARIES = [0.3, 0.65, 1];

export const useScrollStore = create<ScrollState>()((set) => ({
  progress: 0,
  stationIndex: 0,
  setProgress: (progress) =>
    set({
      progress,
      stationIndex: STATION_BOUNDARIES.findIndex(
        (boundary) => progress <= boundary,
      ),
    }),
}));
