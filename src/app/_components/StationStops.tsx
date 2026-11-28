"use client";

import { AnimatePresence, motion, stagger, type Variants } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
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
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const italic = (chunks: ReactNode) => <i lang="en">{chunks}</i>;

const StationStops = () => {
  const locale = useLocale();
  const t = useTranslations("home");
  const { isJumping } = useJumpMaskContext();

  const dwellingIndex = useScrollStore((state) =>
    state.isSynced
      ? getDwellingStationIndex(state.progress, STATION_RANGES)
      : null,
  );

  const stationId =
    dwellingIndex === null ? null : STATION_WEIGHTS[dwellingIndex].id;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[15dvh] z-10 flex justify-center px-4"
    >
      <AnimatePresence mode="wait" custom={{ isJumping }}>
        {stationId !== null && (
          <motion.div
            key={`${stationId}-${locale}`}
            className="flex max-w-prose flex-col items-center gap-3 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.p
              className="text-sm tracking-widest text-gold"
              variants={childVariants}
            >
              {t(`stops.${stationId}.year`)}
            </motion.p>

            <motion.h2 className="text-3xl" variants={childVariants}>
              {t(`stops.${stationId}.name`)}
            </motion.h2>

            <motion.p
              className="text-muted-foreground"
              variants={childVariants}
            >
              {t.rich(`stops.${stationId}.line`, { i: italic })}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StationStops;
