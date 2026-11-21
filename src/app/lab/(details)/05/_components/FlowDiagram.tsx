import type { ReactNode } from "react";

type FlowStep =
  | { kind: "data"; id: string; label: ReactNode }
  | { kind: "fn"; id: string; label: ReactNode; uses?: ReactNode };

type Flow = { id: string; title: string; steps: FlowStep[] };

/**
 * One row per flow: data in boxes, the function that turns one into the next
 * on the arrow between them, and any extra input it reads underneath.
 */
const FlowDiagram = ({ flows }: { flows: Flow[] }) => (
  <div className="space-y-5">
    {flows.map((flow) => (
      <figure key={flow.id} className="space-y-2">
        <figcaption className="text-sm text-muted-foreground">
          {flow.title}
        </figcaption>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {flow.steps.map((step) =>
            step.kind === "data" ? (
              <li
                key={step.id}
                className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-sm text-parchment"
              >
                {step.label}
              </li>
            ) : (
              <li
                key={step.id}
                className="flex flex-col items-center text-xs text-muted-foreground"
              >
                <span>{step.label}</span>
                <span aria-hidden="true" className="text-gold">
                  ──▶
                </span>
                {step.uses && <span>{step.uses}</span>}
              </li>
            ),
          )}
        </ol>
      </figure>
    ))}
  </div>
);

export type { Flow };
export default FlowDiagram;
