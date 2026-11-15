import type { PropsWithChildren } from "react";

/** Inline code within prose. */
const Code = ({ children }: PropsWithChildren) => (
  <code className="rounded bg-parchment/10 px-1.5 py-0.5 text-[0.85em] text-gold">
    {children}
  </code>
);

export default Code;
