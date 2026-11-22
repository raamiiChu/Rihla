import type { ReactNode } from "react";
import type { Concept, Pitfall, Verification } from "@/app/lab/_components";

/** Everything unit 00 says, in one locale. Each locale file must fill all of it. */
type Unit00Content = {
  intro: ReactNode;
  demoCaption: ReactNode;
  concepts: Concept[];
  pitfalls: Pitfall[];
  verifications: Verification[];
};

export type { Unit00Content };
