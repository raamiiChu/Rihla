"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Legend, { type LegendLabels } from "./Legend";
import SceneLoader from "./SceneLoader";

const COUNTS = [8, 16, 64, 256] as const;

type DemoLabels = {
  open: string;
  closed: string;
  count: string;
  legend: LegendLabels;
};

type DemoProps = {
  labels: DemoLabels;
};

/**
 * Holds the settings and the buttons. The labels come in as props, so the
 * scene below never depends on the locale.
 */
const Demo = ({ labels }: DemoProps) => {
  const [closed, setClosed] = useState(false);
  const [count, setCount] = useState<number>(COUNTS[1]);

  return (
    <div className="relative h-full">
      <div className="absolute inset-x-4 top-4 z-10 flex flex-wrap gap-4">
        <div className="flex gap-1">
          <Button
            variant={closed ? "outline" : "default"}
            aria-pressed={!closed}
            onClick={() => setClosed(false)}
          >
            {labels.open}
          </Button>
          <Button
            variant={closed ? "default" : "outline"}
            aria-pressed={closed}
            onClick={() => setClosed(true)}
          >
            {labels.closed}
          </Button>
        </div>

        <fieldset className="flex gap-1">
          <legend className="sr-only">{labels.count}</legend>
          {COUNTS.map((value) => (
            <Button
              key={value}
              variant={count === value ? "default" : "outline"}
              aria-pressed={count === value}
              onClick={() => setCount(value)}
            >
              {value}
            </Button>
          ))}
        </fieldset>
      </div>

      <SceneLoader count={count} closed={closed} />
      <Legend labels={labels.legend} />
    </div>
  );
};

export type { DemoLabels };
export default Demo;
