import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { DemoLabels } from "../_components";

/** Everything unit 08 says, in one locale. Each locale file must fill all of it. */
type Unit08Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  /** Plain strings: they are passed to a client component as props. */
  demoLabels: DemoLabels;
  steps: Step[];
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { Unit08Content };
