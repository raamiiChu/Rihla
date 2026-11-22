import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";

type LineId = "three-line" | "drei-line" | "line2";
type RotationId = "euler" | "matrix" | "quaternion";
type LayoutId = "position" | "tangent" | "up";
type GateId = "distance" | "vertical" | "upright";
type LevellingId = "none" | "vertical-only" | "both";

/** A paragraph with a stable key, for lists of prose. */
type Paragraph = Verification;

/** Everything unit 04 says, in one locale. Each locale file must fill all of it. */
type Unit04Content = {
  intro: ReactNode;
  /** Plain text: the demo pane's screen-reader caption. */
  demoCaption: string;
  steps: Step[];
  sections: {
    controlPoints: {
      title: string;
      /** Before the segment table. */
      before: Paragraph[];
      /** After the segment table. */
      after: ReactNode;
    };
    lines: { title: string };
    layout: { title: string; intro: ReactNode };
    sampling: { title: string; paragraphs: Paragraph[] };
    rotation: { title: string; paragraphs: Paragraph[] };
    levelling: {
      title: string;
      intro: ReactNode;
      /** Between the gate table and the results table. */
      between: ReactNode;
    };
  };
  tables: {
    segment: {
      caption: string;
      columns: { segment: string; length: string };
    };
    line: {
      caption: string;
      columns: {
        approach: string;
        underlying: string;
        width: string;
        disposal: string;
        usedFor: string;
      };
      rows: Record<
        LineId,
        {
          approach: ReactNode;
          underlying: ReactNode;
          width: string;
          disposal: string;
          usedFor: string;
        }
      >;
    };
    layout: {
      caption: string;
      columns: { field: string; offset: string; size: string; purpose: string };
      purpose: Record<LayoutId, string>;
    };
    rotation: {
      caption: string;
      columns: {
        representation: string;
        size: string;
        tradeoff: string;
        usedFor: string;
      };
      /** Prefixes for the pro and con lines in the trade-off cell. */
      pro: string;
      con: string;
      rows: Record<
        RotationId,
        {
          representation: ReactNode;
          pro: string;
          con: string;
          usedFor: ReactNode;
        }
      >;
    };
    gate: {
      caption: string;
      columns: {
        factor: string;
        question: string;
        formula: string;
        full: string;
        none: string;
      };
      rows: Record<
        GateId,
        {
          factor: string;
          question: string;
          formula: ReactNode;
          full: string;
          none: string;
        }
      >;
    };
    levelling: {
      caption: string;
      columns: {
        version: string;
        exitTilt: string;
        sampleDifference: string;
        top: string;
      };
      rows: Record<LevellingId, { version: string; top: string }>;
    };
  };
  math: { title: string; items: Concept[] };
  concepts: Concept[];
  levelling: { title: string; items: Concept[] };
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type {
  GateId,
  LayoutId,
  LevellingId,
  LineId,
  RotationId,
  Unit04Content,
};
