import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { Code } from "@/app/lab/_components";

type Driver = "fallback" | "r3f" | "none";

type StageId = "initial" | "created" | "lost" | "restored" | "unmount";

/** The wording of the timeline; the stages themselves are the same in every locale. */
type DriverTimelineLabels = {
  drivers: Record<Driver, string>;
  notes: Record<StageId, string>;
  /** The trigger of the last stage, which is an event rather than code. */
  unmount: string;
};

type Stage = {
  id: StageId;
  /** The event that moves the driver into this stage; absent for the first stage. */
  trigger?: ReactNode;
  driver: Driver;
};

const DRIVER_STYLE: Record<Driver, string> = {
  fallback: "border-foreground/20 text-foreground",
  r3f: "border-primary/50 text-primary",
  none: "border-border text-muted-foreground",
};

const getStages = (labels: DriverTimelineLabels): Stage[] => [
  { id: "initial", driver: "fallback" },
  { id: "created", trigger: <Code>onCreated</Code>, driver: "r3f" },
  { id: "lost", trigger: <Code>webglcontextlost</Code>, driver: "fallback" },
  {
    id: "restored",
    trigger: <Code>webglcontextrestored</Code>,
    driver: "r3f",
  },
  { id: "unmount", trigger: labels.unmount, driver: "none" },
];

/** How the Lenis driver changes over the page's lifetime. */
const DriverTimeline = ({ labels }: { labels: DriverTimelineLabels }) => (
  <ol className="space-y-2">
    {getStages(labels).map((stage) => (
      <li key={stage.id} className="space-y-2">
        {stage.trigger && (
          <p className="flex items-center gap-2 ps-4 text-sm text-muted-foreground">
            <ArrowDown aria-hidden="true" className="size-4 shrink-0" />
            {stage.trigger}
          </p>
        )}
        <div
          className={`flex items-baseline justify-between gap-4 rounded-lg border px-4 py-2 ${DRIVER_STYLE[stage.driver]}`}
        >
          <span>{labels.drivers[stage.driver]}</span>
          <span className="text-sm text-muted-foreground">
            {labels.notes[stage.id]}
          </span>
        </div>
      </li>
    ))}
  </ol>
);

export type { DriverTimelineLabels };
export default DriverTimeline;
