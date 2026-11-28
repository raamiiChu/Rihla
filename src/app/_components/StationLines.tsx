"use client";

import { AnimatePresence, motion, stagger, type Variants } from "motion/react";
import { useLocale } from "next-intl";
import { STATION_RANGES, STATION_WEIGHTS } from "@/data/timeline";
import { getDwellingStationIndex } from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { useJumpMaskContext } from "../_contexts/JumpMaskProvider";

const containerVariants: Variants = {
  visible: {
    transition: {
      delayChildren: stagger(0.2),
    },
  },
  exit: ({ isJumping }: { isJumping: boolean }) => ({
    opacity: 0,
    transition: {
      duration: isJumping ? 0 : 1,
    },
  }),
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const StationLines = () => {
  const locale = useLocale();
  const { isJumping } = useJumpMaskContext();

  const dwellingIndex = useScrollStore((state) =>
    state.isSynced
      ? getDwellingStationIndex(state.progress, STATION_RANGES)
      : null,
  );

  const stationId =
    dwellingIndex === null ? null : STATION_WEIGHTS[dwellingIndex].id;

  return (
    <AnimatePresence mode="wait" custom={{ isJumping }}>
      {stationId !== null && (
        <motion.div
          key={`${stationId}-${locale}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {[1, 2, 3].map((id) => (
            <motion.p key={id} variants={childVariants}>
              Line: {id}
            </motion.p>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StationLines;
