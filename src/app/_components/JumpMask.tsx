"use client";

import { useJumpMaskContext } from "../_contexts/JumpMaskProvider";

const JumpMask = () => {
  const { scope } = useJumpMaskContext();

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 bg-background opacity-0"
    />
  );
};

export default JumpMask;
