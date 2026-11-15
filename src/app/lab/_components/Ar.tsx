import type { PropsWithChildren } from "react";

/**
 * Arabic text inside Chinese or English prose.
 *
 * - `lang="ar"`: picks Amiri first, applies the Arabic size and line height
 *   from globals.css, and lets screen readers switch pronunciation.
 * - `dir="rtl"`: an element with `dir` is also isolated from the surrounding
 *   text, so mixed-direction runs (punctuation, spaces) stay in the right order.
 */
const Ar = ({ children }: PropsWithChildren) => (
  <span lang="ar" dir="rtl">
    {children}
  </span>
);

export default Ar;
