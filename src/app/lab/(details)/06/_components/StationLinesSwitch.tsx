"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import StationLines from "./StationLines";
import StationLinesWrong from "./StationLinesWrong";

type Version = "fixed" | "broken";

const VERSIONS: readonly Version[] = ["fixed", "broken"];

type LinesSwitchLabels = { label: string } & Record<Version, string>;

/**
 * Swaps the text layer between the fixed and broken versions, to compare
 * them on a language change. Switching unmounts one and mounts the other, so
 * the current station's lines enter again.
 */
const StationLinesSwitch = ({ labels }: { labels: LinesSwitchLabels }) => {
  const [version, setVersion] = useState<Version>("fixed");

  return (
    <>
      <div className="absolute inset-e-4 top-16 z-20 rounded-lg bg-background/70 backdrop-blur-sm">
        <ButtonGroup aria-label={labels.label}>
          {VERSIONS.map((value) => (
            <Button
              key={value}
              variant="outline"
              aria-pressed={value === version}
              className="aria-pressed:text-primary"
              onClick={() => setVersion(value)}
            >
              {labels[value]}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="pointer-events-none absolute inset-s-5 bottom-32 z-20">
        {version === "fixed" ? <StationLines /> : <StationLinesWrong />}
      </div>
    </>
  );
};

export type { LinesSwitchLabels };
export default StationLinesSwitch;
