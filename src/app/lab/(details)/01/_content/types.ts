import type { ReactNode } from "react";
import type {
  Concept,
  Pitfall,
  Step,
  Verification,
} from "@/app/lab/_components";
import type { GlyphForm } from "../_components/dihli";

/** Everything unit 01 says, in one locale. Each locale file must fill all of it. */
type Unit01Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  /** Plain text: it becomes the SVG's `<title>`. */
  diagramTitle: string;
  steps: Step[];
  conclusions: { title: string; items: Verification[] };
  measurements: {
    title: string;
    metricCaption: ReactNode;
    glyphCaption: ReactNode;
    columns: {
      font: string;
      letter: string;
      codePoint: string;
      form: string;
    };
    /** Appended to the name of the font the project uses. */
    adopted: string;
    forms: Record<GlyphForm, string>;
  };
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { Unit01Content };
