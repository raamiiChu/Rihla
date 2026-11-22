import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { PacingLabels } from "../_components/PacingReadout";
import type { LinesSwitchLabels } from "../_components/StationLinesSwitch";

/** Everything unit 06 says, in one locale. Each locale file must fill all of it. */
type Unit06Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  demo: {
    navLabel: string;
    linesSwitch: LinesSwitchLabels;
    readout: PacingLabels;
  };
  steps: Step[];
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { Unit06Content };
