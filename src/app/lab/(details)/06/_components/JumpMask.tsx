"use client";

import { useJumpMaskContext } from "../_contexts/JumpMaskProvider";

/**
 * Covers the demo pane during a long jump, so the camera is never seen
 * racing past the stations in between. `maskedJump` drives its opacity
 * through `scope`; it rests at 0.
 *
 * It sits above every overlay (z-30 over their z-20) yet must never catch a
 * click: invisible as it is, it would otherwise block the buttons below.
 */
const JumpMask = () => {
  const { scope } = useJumpMaskContext();

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 bg-background opacity-0"
    />
  );
};

export default JumpMask;
