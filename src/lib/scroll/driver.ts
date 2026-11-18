import type Lenis from "lenis";

export type Driver = "fallback" | "r3f" | "none";
type Source = Exclude<Driver, "none">;
type AddEffect = (callback: (timestamp: number) => void) => () => void;

let lenis: Lenis | null = null;
let fallbackId: number | null = null;
let removeEffect: (() => void) | null = null;
let previousTimestamp: number | null = null;

let counts: Record<Source, number> = { fallback: 0, r3f: 0 };
let duplicates = 0;

export const getDriver = (): Driver => {
  if (fallbackId !== null) {
    return "fallback";
  }

  if (removeEffect !== null) {
    return "r3f";
  }

  return "none";
};

const tick = (timestamp: number, source: Source) => {
  if (lenis === null) {
    return;
  }

  if (previousTimestamp === timestamp) {
    duplicates += 1;
  }

  lenis.raf(timestamp);
  counts[source] += 1;
  previousTimestamp = timestamp;
};

const stop = () => {
  if (fallbackId !== null) {
    cancelAnimationFrame(fallbackId);
    fallbackId = null;
  }

  if (removeEffect !== null) {
    removeEffect();
    removeEffect = null;
  }
};

export const driveWithFallback = () => {
  if (lenis === null) {
    return;
  }

  if (getDriver() === "fallback") {
    return;
  }

  stop();

  const loop = (timestamp: number) => {
    tick(timestamp, "fallback");
    fallbackId = requestAnimationFrame(loop);
  };
  fallbackId = requestAnimationFrame(loop);
};

export const driveWithR3f = (addEffect: AddEffect) => {
  if (lenis === null) {
    return;
  }

  if (getDriver() === "r3f") {
    return;
  }

  stop();

  removeEffect = addEffect((timestamp) => tick(timestamp, "r3f"));
};

// after rebuilding Lenis, it will stop at fallback,
// it will be fixed in Unit 16
export const attachLenis = (instance: Lenis) => {
  lenis = instance;
  previousTimestamp = null;
  counts = { fallback: 0, r3f: 0 };
  duplicates = 0;

  driveWithFallback();
};

export const detachLenis = () => {
  stop();
  lenis = null;
};

export const getStats = () => {
  return {
    driver: getDriver(),
    // A copy, so callers cannot mutate the module's counters.
    counts: { ...counts },
    duplicates,
  };
};
