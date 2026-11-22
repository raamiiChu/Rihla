"use client";

import { useEffect, useRef } from "react";
import { getRailProgress } from "@/lib/camera/pacing";
import { getSkipDestination, getStationIndex } from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { STATION_RAIL_POSITIONS } from "../_utils/rail";
import { DEMO_STATION_RANGES } from "../_utils/timeline";

const ROWS = ["station", "phase", "progress", "rail", "skip"] as const;
type Row = (typeof ROWS)[number];

/** One label per row, plus the two phase names written into the phase cell. */
type PacingLabels = Record<Row | "flight" | "dwell", string>;

const PLACEHOLDER = "—";

const PacingReadout = ({ labels }: { labels: PacingLabels }) => {
  const cellRefs = useRef<Partial<Record<Row, HTMLElement | null>>>({});

  useEffect(() => {
    const write = (row: Row, text: string) => {
      const cell = cellRefs.current[row];
      if (cell) {
        cell.textContent = text;
      }
    };

    const update = (progress: number) => {
      const index = getStationIndex(progress, DEMO_STATION_RANGES);
      const range = DEMO_STATION_RANGES[index];
      const inFlight = progress < range.flightEnd;
      const destination = getSkipDestination(progress, DEMO_STATION_RANGES);
      const rail = getRailProgress(
        progress,
        DEMO_STATION_RANGES,
        STATION_RAIL_POSITIONS,
      );

      write("progress", progress.toFixed(4));
      write("station", `${index} ${range.id}`);
      write("phase", inFlight ? labels.flight : labels.dwell);
      write("rail", rail.toFixed(4));
      write(
        "skip",
        destination === null ? PLACEHOLDER : destination.toFixed(4),
      );

      const phaseCell = cellRefs.current.phase;
      if (phaseCell) {
        phaseCell.dataset.phase = inFlight ? "flight" : "dwell";
      }
    };

    update(useScrollStore.getState().progress);

    // Runs only when the store is written, unlike a rAF loop that polls
    // every frame. The DOM is written directly, so React never re-renders.
    return useScrollStore.subscribe((state) => update(state.progress));
  }, [labels]);

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-background/70 px-4 py-3 backdrop-blur-sm sm:grid-cols-5">
      {ROWS.map((key) => (
        <div key={key} className="space-y-1">
          <dt className="text-xs text-muted-foreground">{labels[key]}</dt>
          <dd
            ref={(element) => {
              cellRefs.current[key] = element;
            }}
            className="tabular-nums data-[phase=dwell]:text-primary"
          >
            {PLACEHOLDER}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export type { PacingLabels };
export default PacingReadout;
