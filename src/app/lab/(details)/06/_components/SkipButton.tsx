"use client";

import { Button } from "@/components/ui/button";
import { scrollToProgress } from "@/lib/scroll/driver";
import { getSkipDestination } from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { DEMO_STATION_RANGES } from "../_utils/timeline";

const SkipButton = () => {
  const destination = useScrollStore((state) =>
    getSkipDestination(state.progress, DEMO_STATION_RANGES),
  );

  const skip = () => {
    if (destination === null) {
      return;
    }
    scrollToProgress(destination);
  };

  return (
    <Button className="w-20" onClick={skip} disabled={destination === null}>
      Skip
    </Button>
  );
};

export default SkipButton;
