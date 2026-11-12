import type { PropsWithChildren } from "react";

/** Two-column layout for unit pages: notes, plus a demo pane at the end. */
const LabDetailsLayout = ({ children }: PropsWithChildren) => {
  return <div className="lg:grid lg:grid-cols-2">{children}</div>;
};

export default LabDetailsLayout;
