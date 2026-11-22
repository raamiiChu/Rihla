"use client";

import { useAnimate } from "motion/react";
import { createContext, useContext, useState } from "react";
import { scrollToProgress } from "@/lib/scroll/driver";

type JumpMaskContext = {
  scope: React.RefObject<HTMLDivElement>;
  maskedJump: (destination: number) => Promise<void>;
  isJumping: boolean;
};

const JumpMaskContext = createContext<JumpMaskContext | null>(null);

export function JumpMaskProvider({ children }: { children: React.ReactNode }) {
  const [isJumping, setIsJumping] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const maskedJump = async (destination: number) => {
    if (isJumping) {
      return;
    }

    setIsJumping(true);

    try {
      await animate(scope.current, { opacity: 1 }, { duration: 0.2 });
      scrollToProgress(destination, { immediate: true });
      await animate(scope.current, { opacity: 0 }, { duration: 0.2 });
    } finally {
      setIsJumping(false);
    }
  };

  return (
    <JumpMaskContext.Provider
      value={{
        scope,
        maskedJump,
        isJumping,
      }}
    >
      {children}
    </JumpMaskContext.Provider>
  );
}

export function useJumpMaskContext() {
  const context = useContext(JumpMaskContext);

  if (!context) {
    throw new Error(
      "useJumpMaskContext must be used within a JumpMaskProvider",
    );
  }

  return context;
}
