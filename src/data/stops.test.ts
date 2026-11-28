import { describe, expect, it } from "vitest";
import enGB from "../../messages/en-GB.json";
import zhTW from "../../messages/zh-TW.json";
import { STOPS } from "./stops";
import { STATION_WEIGHTS } from "./timeline";

/** Backgrounds stay dark, though they may carry a tint. */
const MAX_BACKGROUND_BRIGHTNESS = 50;
/** Lines and accents stay clear of black, which additive blending hides. */
const MIN_LINE_BRIGHTNESS = 50;

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

/**
 * Perceived brightness, 0–255, from the common weighting of sRGB channels
 * (299 : 587 : 114, as in the YIQ colour space). An approximation, not true
 * luminance, but enough to tell dark from bright.
 */
const getBrightness = (hex: string) => {
  if (!HEX_COLOUR.test(hex)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return (r * 299 + g * 587 + b * 114) / 1000;
};

const STOP_ENTRIES = Object.entries(STOPS);

describe("STOPS", () => {
  it.each(STATION_WEIGHTS)("has a stop for $id", ({ id }) => {
    expect(STOPS[id]).toBeDefined();
  });

  describe.each(STOP_ENTRIES)("%s", (_, { palette, coordinates }) => {
    it.each(Object.entries(palette))("writes %s as #rrggbb", (_, colour) => {
      expect(colour).toMatch(HEX_COLOUR);
    });

    it("has a dark background", () => {
      expect(getBrightness(palette.background)).toBeLessThan(
        MAX_BACKGROUND_BRIGHTNESS,
      );
    });

    it.each(["line", "accent"] as const)("has a %s clear of black", (role) => {
      expect(getBrightness(palette[role])).toBeGreaterThanOrEqual(
        MIN_LINE_BRIGHTNESS,
      );
    });

    it("has a latitude within ±90° and a longitude within ±180°", () => {
      expect(Math.abs(coordinates.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(coordinates.lon)).toBeLessThanOrEqual(180);
    });
  });
});

describe.each([
  { locale: "en-GB", messages: enGB },
  { locale: "zh-TW", messages: zhTW },
])("$locale messages", ({ messages }) => {
  const stops: Record<string, unknown> = messages.home.stops;

  it.each(STATION_WEIGHTS)("have copy for $id", ({ id }) => {
    expect(stops[id]).toBeDefined();
  });
});
