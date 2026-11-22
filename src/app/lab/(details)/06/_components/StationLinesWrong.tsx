"use client";

import { AnimatePresence, motion, stagger, type Variants } from "motion/react";
import { useLabLocale } from "@/app/lab/_i18n";
import { getDwellingStationIndex } from "@/lib/timeline/stations";
import { useScrollStore } from "@/stores/scroll";
import { LINES } from "../_content/lines";
import { useJumpMaskContext } from "../_contexts/JumpMaskProvider";
import {
  DEMO_STATION_RANGES,
  DEMO_STATION_WEIGHTS,
  type DemoStationId,
} from "../_utils/timeline";

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

const Lines = ({ stationId }: { stationId: DemoStationId }) => {
  const locale = useLabLocale();
  const lines = LINES[locale][stationId];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {Object.entries(lines).map(([id, line]) => (
        <motion.p key={id} variants={childVariants}>
          {line}
        </motion.p>
      ))}
    </motion.div>
  );
};

const StationLinesWrong = () => {
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
        <Lines key={`${stationId}-${locale}`} stationId={stationId} />
      )}
    </AnimatePresence>
  );
};

export default StationLinesWrong;
