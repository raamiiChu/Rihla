import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { Code } from "@/app/lab/_components";

type Driver = "fallback" | "r3f" | "none";

type Stage = {
  id: string;
  /** The event that moves the driver into this stage; absent for the first stage. */
  trigger?: ReactNode;
  driver: Driver;
  note: string;
};

const DRIVER_LABEL: Record<Driver, string> = {
  fallback: "fallback 驅動",
  r3f: "R3F 驅動",
  none: "全部停止",
};

const DRIVER_STYLE: Record<Driver, string> = {
  fallback: "border-foreground/20 text-foreground",
  r3f: "border-primary/50 text-primary",
  none: "border-border text-muted-foreground",
};

const STAGES: Stage[] = [
  { id: "initial", driver: "fallback", note: "Canvas 掛載前" },
  {
    id: "created",
    trigger: <Code>onCreated</Code>,
    driver: "r3f",
    note: "Canvas 就緒",
  },
  {
    id: "lost",
    trigger: <Code>webglcontextlost</Code>,
    driver: "fallback",
    note: "畫面停住，仍可捲動",
  },
  {
    id: "restored",
    trigger: <Code>webglcontextrestored</Code>,
    driver: "r3f",
    note: "恢復渲染",
  },
  { id: "unmount", trigger: "卸載", driver: "none", note: "任何階段皆可能" },
];

/** How the Lenis driver changes over the page's lifetime. */
const DriverTimeline = () => (
  <ol className="space-y-2">
    {STAGES.map((stage) => (
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
          <span>{DRIVER_LABEL[stage.driver]}</span>
          <span className="text-sm text-muted-foreground">{stage.note}</span>
        </div>
      </li>
    ))}
  </ol>
);

export default DriverTimeline;
