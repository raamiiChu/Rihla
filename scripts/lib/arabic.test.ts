import { describe, expect, it } from "vitest";
import { stripHarakat } from "./arabic";

// Strings are written as escapes so the exact code points are unambiguous:
// right-to-left text and combining marks are hard to read in an editor.

describe("stripHarakat", () => {
  it.each([
    {
      case: "kasra and sukun (دِهْلِي → دهلي)",
      input: "\u062F\u0650\u0647\u0652\u0644\u0650\u064A",
      expected: "\u062F\u0647\u0644\u064A",
    },
    {
      case: "fatha, damma and kasra (رِحْلَةُ → رحلة)",
      input: "\u0631\u0650\u062D\u0652\u0644\u064E\u0629\u064F",
      expected: "\u0631\u062D\u0644\u0629",
    },
    {
      case: "vowels and tanwin but keeps shadda (مُحَمَّدٌ → محمّد)",
      input: "\u0645\u064F\u062D\u064E\u0645\u0651\u064E\u062F\u064C",
      expected: "\u0645\u062D\u0645\u0651\u062F",
    },
    {
      case: "superscript alef (هٰذا → هذا)",
      input: "\u0647\u0670\u0630\u0627",
      expected: "\u0647\u0630\u0627",
    },
  ])("removes $case", ({ input, expected }) => {
    expect(stripHarakat(input)).toBe(expected);
  });

  it.each([
    {
      case: "hamza above on alef (ا + ٔ → أ)",
      input: "\u0627\u0654",
      expected: "\u0623",
    },
    {
      case: "hamza below on alef (ا + ٕ → إ)",
      input: "\u0627\u0655",
      expected: "\u0625",
    },
    {
      case: "hamza above on waw (و + ٔ → ؤ)",
      input: "\u0648\u0654",
      expected: "\u0624",
    },
  ])(
    "composes a decomposed $case instead of stripping it",
    ({ input, expected }) => {
      expect(stripHarakat(input)).toBe(expected);
    },
  );

  it.each([
    {
      case: "shadda on its own (حجّ)",
      input: "\u062D\u062C\u0651",
    },
    {
      case: "maddah NFC cannot compose (لٓ)",
      input: "\u0644\u0653",
    },
    {
      case: "wavy hamza below (بٟ)",
      input: "\u0628\u065F",
    },
  ])("keeps $case", ({ input }) => {
    expect(stripHarakat(input)).toBe(input);
  });

  it("composes a decomposed maddah on alef (ا + ٓ → آ)", () => {
    expect(stripHarakat("\u0627\u0653")).toBe("\u0622");
  });

  it("keeps a combining hamza that NFC cannot compose", () => {
    // Lam has no precomposed hamza form, so U+0654 survives NFC and must be
    // spared by the regular expression itself.
    expect(stripHarakat("\u0644\u0654")).toBe("\u0644\u0654");
  });

  it("removes harakat but keeps the hamza on the same letter (أَ → أ)", () => {
    expect(stripHarakat("\u0627\u0654\u064E")).toBe("\u0623");
  });

  it("leaves unvocalised text, letter dots and other scripts untouched", () => {
    // دهلي رحلة plus Latin: نقط (dots) belong to the letters, not to harakat.
    const text = "\u062F\u0647\u0644\u064A \u0631\u062D\u0644\u0629 Rihla";
    expect(stripHarakat(text)).toBe(text);
  });
});
