import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";

type ReadId = "selector" | "get-state" | "set";
type RenderId = "station" | "progress" | "wrong";

/** Everything unit 02 says, in one locale. Each locale file must fill all of it. */
type Unit02Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  steps: Step[];
  conclusions: { title: string; items: Verification[] };
  readTable: {
    title: string;
    caption: ReactNode;
    columns: { syntax: string; rerender: string; usage: string };
    rows: Record<ReadId, { rerender: string; usage: string }>;
  };
  renderTable: {
    title: string;
    caption: ReactNode;
    columns: { component: string; read: string };
    rows: Record<RenderId, { highlight: string; log: string }>;
  };
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { ReadId, RenderId, Unit02Content };
