"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { scrollToProgress } from "@/lib/scroll/driver";
import {
  countDestinationsBetween,
  getStationIndex,
} from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { DEMO_STATION_RANGES } from "../_utils/timeline";

const STATIONS = DEMO_STATION_RANGES.map(
  ({ id, flightEnd, dwellEnd }, index) => ({
    id,
    index,
    destination: flightEnd,
    hasDwell: dwellEnd > flightEnd,
  }),
).filter(({ hasDwell }) => hasDwell);

const StationNav = ({ label }: { label: string }) => {
  const currentIndex = useScrollStore((state) =>
    getStationIndex(state.progress, DEMO_STATION_RANGES),
  );

  const jump = (destination: number) => {
    const { progress } = useScrollStore.getState();
    const immediate =
      countDestinationsBetween(progress, destination, DEMO_STATION_RANGES) > 0;
    scrollToProgress(destination, { immediate });
  };

  return (
    <nav aria-label={label}>
      <ButtonGroup>
        {STATIONS.map(({ id, index, destination }) => (
          <Button
            key={id}
            variant="outline"
            aria-current={index === currentIndex ? "step" : undefined}
            className="aria-[current=step]:text-primary"
            onClick={() => jump(destination)}
          >
            {id}
          </Button>
        ))}
      </ButtonGroup>
    </nav>
  );
};

export default StationNav;
