import type { PropsWithChildren } from "react";

type DemoPaneProps = PropsWithChildren<{
  /** Describes the demo for screen readers, since a canvas has no readable content. */
  caption: string;
}>;

/**
 * The demo column. Below `lg` it sits on top; from `lg` it moves to the end
 * column and stays in view while the notes scroll.
 * The Canvas fills its parent, so this pane must have an explicit height.
 */
const DemoPane = ({ caption, children }: DemoPaneProps) => (
  <figure className="h-[55dvh] border-b border-neutral-900 lg:sticky lg:top-0 lg:order-last lg:h-dvh lg:self-start lg:border-s lg:border-b-0">
    {children}
    <figcaption className="sr-only">{caption}</figcaption>
  </figure>
);

/** The notes column: a self-contained article with a readable line length. */
const NotesPane = ({ children }: PropsWithChildren) => (
  <article className="px-6 py-12 lg:px-12 lg:py-16">
    <div className="max-w-prose text-[15px] leading-relaxed">{children}</div>
  </article>
);

export { DemoPane, NotesPane };
