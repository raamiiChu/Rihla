import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { DriverTimelineLabels } from "../_components/DriverTimeline";

type Paragraph = Verification;

type DriverReadoutLabels = {
  driver: string;
  fallback: string;
  r3f: string;
  duplicates: string;
};

/** Everything unit 03 says, in one locale. Each locale file must fill all of it. */
type Unit03Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  readout: DriverReadoutLabels;
  steps: Step[];
  handoff: {
    title: string;
    timeline: DriverTimelineLabels;
    paragraphs: Paragraph[];
  };
  findings: { title: string; body: ReactNode };
  limitations: { title: string; paragraphs: Paragraph[] };
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { DriverReadoutLabels, Unit03Content };
