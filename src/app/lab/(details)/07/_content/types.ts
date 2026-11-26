import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { DemoLabels } from "../_components";
import type {
  NearestFlowLabel,
  ResampleFlowLabel,
} from "../_components/flowLayouts";

/** One flowchart's words: each label is a list of lines, as SVG does not wrap. */
type FlowChartContent<Label extends string> = {
  title: string;
  labels: Record<Label, string[]>;
};

/** Everything unit 07 says, in one locale. Each locale file must fill all of it. */
type Unit07Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  /** Plain strings: they are passed to a client component as props. */
  demoLabels: DemoLabels;
  steps: Step[];
  flowCharts: {
    title: string;
    intro: ReactNode;
    resample: FlowChartContent<ResampleFlowLabel>;
    nearest: FlowChartContent<NearestFlowLabel>;
  };
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { Unit07Content };
