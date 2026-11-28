import type { StationId } from "./timeline";

/** A CSS hex colour, e.g. `#d9a441`. */
type HexColour = `#${string}`;

/**
 * A station's colours by role. Plain sRGB hex, shared by the DOM and the
 * scene; pushing the line and accent above 1.0 for Bloom happens when they
 * are drawn, not here. Never near-black for `line` or `accent`: with additive
 * blending, black is invisible.
 */
type Palette = {
  /** Always dark, though it may carry a tint. */
  background: HexColour;
  line: HexColour;
  accent: HexColour;
};

/**
 * What a station is, whatever the language. Names, years and narration live
 * in `messages/*.json`, keyed by the same id; the order and where each shape
 * sits in the world live in `timeline.ts`.
 */
type Stop = {
  coordinates: { lat: number; lon: number };
  palette: Palette;
  /**
   * A line of the original Arabic, with its harakat, shown in the DOM beside
   * its translation. `null` until a line has been chosen and checked against
   * the source.
   */
  quote: string | null;
};

/** The globe scenes at either end: near-black space, warm gold, white. */
const GLOBE_PALETTE: Palette = {
  background: "#05060a",
  line: "#e8b45a",
  accent: "#ffffff",
};

/**
 * Every station in the timeline, by id. Typed as a `Record` over
 * `StationId`, so a station added to the timeline without an entry here
 * fails to compile. The colours are placeholders until the scenes exist.
 */
const STOPS: Record<StationId, Stop> = {
  tangier: {
    coordinates: { lat: 35.76, lon: -5.83 },
    palette: GLOBE_PALETTE,
    quote: null,
  },
  mecca: {
    coordinates: { lat: 21.42, lon: 39.83 },
    palette: { background: "#0a0908", line: "#d9a441", accent: "#fff3df" },
    quote: null,
  },
  samarkand: {
    coordinates: { lat: 39.65, lon: 66.96 },
    palette: { background: "#0b0f2a", line: "#2ec4c6", accent: "#3b6fe0" },
    quote: null,
  },
  delhi: {
    coordinates: { lat: 28.61, lon: 77.21 },
    palette: { background: "#1e0b0d", line: "#f28c28", accent: "#e6b84a" },
    quote: null,
  },
  maldives: {
    coordinates: { lat: 4.18, lon: 73.51 },
    palette: { background: "#03191c", line: "#2fd8c0", accent: "#f2fbff" },
    quote: null,
  },
  quanzhou: {
    coordinates: { lat: 24.87, lon: 118.68 },
    palette: { background: "#0a0e1f", line: "#5cc79a", accent: "#e8eef2" },
    quote: null,
  },
  timbuktu: {
    coordinates: { lat: 16.77, lon: -3.0 },
    palette: { background: "#1c1208", line: "#e0a83a", accent: "#f3e6cc" },
    quote: null,
  },
  fez: {
    coordinates: { lat: 34.02, lon: -5.01 },
    palette: GLOBE_PALETTE,
    quote: null,
  },
};

export type { HexColour, Palette, Stop };
export { STOPS };
