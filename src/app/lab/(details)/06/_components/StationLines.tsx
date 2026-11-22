"use client";

import { AnimatePresence, motion, stagger, type Variants } from "motion/react";
import { useLabLocale } from "@/app/lab/_i18n";
import { getDwellingStationIndex } from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { LINES } from "../_content/lines";
import { useJumpMaskContext } from "../_contexts/JumpMaskProvider";
import { DEMO_STATION_RANGES, DEMO_STATION_WEIGHTS } from "../_utils/timeline";

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
  const locale = useLabLocale();
  const { isJumping } = useJumpMaskContext();

  const dwellingIndex = useScrollStore((state) =>
    state.isSynced
      ? getDwellingStationIndex(state.progress, DEMO_STATION_RANGES)
      : null,
  );

  const stationId =
    dwellingIndex === null ? null : DEMO_STATION_WEIGHTS[dwellingIndex].id;

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
          {Object.entries(LINES[locale][stationId]).map(([id, line]) => (
            <motion.p key={id} variants={childVariants}>
              {line}
            </motion.p>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StationLines;
