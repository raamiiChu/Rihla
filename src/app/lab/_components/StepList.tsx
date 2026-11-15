import type { ReactNode } from "react";

type Step = { id: string; title: ReactNode; done: boolean };

/** Ordered practice steps with their completion state. */
const StepList = ({ items }: { items: Step[] }) => (
  <ol className="space-y-2">
    {items.map((step, position) => (
      <li key={step.id} className="flex items-baseline gap-3">
        <span
          className={`font-mono text-xs tabular-nums ${step.done ? "text-amber-300/80" : "text-neutral-600"}`}
        >
          {String(position + 1).padStart(2, "0")}
        </span>
        <span className={step.done ? "text-neutral-300" : "text-neutral-500"}>
          {step.title}
        </span>
        <span
          className={`ms-auto shrink-0 text-xs ${step.done ? "text-amber-200" : "text-neutral-600"}`}
        >
          {step.done ? "完成" : "未完成"}
        </span>
      </li>
    ))}
  </ol>
);

export type { Step };
export default StepList;
