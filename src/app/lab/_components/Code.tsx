import type { PropsWithChildren } from "react";

/** Inline code within prose. */
const Code = ({ children }: PropsWithChildren) => (
  <code className="rounded bg-neutral-800/70 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-100">
    {children}
  </code>
);

export default Code;
