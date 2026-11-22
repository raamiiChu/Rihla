import type { ReactNode } from "react";
import type {
  Column,
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { Flow } from "../_components/FlowDiagram";
import type { PacingLabels } from "../_components/PacingReadout";
import type { QueryId } from "./tables";

type CoordinateRow = {
  id: string;
  name: string;
  meaning: string;
  values: ReactNode;
};

/** Everything unit 05 says, in one locale. Each locale file must fill all of it. */
type Unit05Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  demo: { navLabel: string; readout: PacingLabels };
  steps: Step[];
  dataFlow: {
    title: string;
    intro: ReactNode;
    buildTitle: string;
    frameTitle: string;
    build: Flow[];
    frame: Flow[];
  };
  timeline: {
    title: string;
    intro: ReactNode;
    caption: ReactNode;
    columns: { station: string; rail: string };
  };
  coordinates: {
    title: string;
    intro: ReactNode;
    caption: ReactNode;
    columns: Column<CoordinateRow>[];
    rows: CoordinateRow[];
  };
  queries: {
    title: string;
    caption: ReactNode;
    columns: { fn: string; file: string; answer: string; when: string };
    rows: Record<QueryId, { answer: string; when: string }>;
  };
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { CoordinateRow, Unit05Content };
