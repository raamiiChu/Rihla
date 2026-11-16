import type { ReactNode } from "react";

type Step = { id: string; title: ReactNode; done: boolean };

/** Ordered practice steps with their completion state. */
const StepList = ({ items }: { items: Step[] }) => (
  <ol className="space-y-2">
    {items.map((step, position) => (
      <li key={step.id} className="flex items-baseline gap-3">
        <span
          className={`text-xs tabular-nums ${step.done ? "text-gold/80" : "text-muted-foreground"}`}
        >
          {String(position + 1).padStart(2, "0")}
        </span>
        <span
          className={step.done ? "text-parchment/90" : "text-muted-foreground"}
        >
          {step.title}
        </span>
        <span
          className={`ms-auto shrink-0 text-xs ${step.done ? "text-gold" : "text-muted-foreground"}`}
        >
          {step.done ? "完成" : "未完成"}
        </span>
      </li>
    ))}
  </ol>
);

export type { Step };
export default StepList;
