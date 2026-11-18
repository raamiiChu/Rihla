import { describe, expect, it } from "vitest";
import { layoutText, loadFont } from "./shape";

const amiri = loadFont("assets/fonts/amiri/Amiri-Regular.ttf");

describe("layoutText", () => {
  it("returns RTL glyphs in visual order (fontkit 3.0.0 behaviour)", () => {
    const { glyphs } = layoutText(amiri, "\u062F\u0647\u0644\u064A"); // دهلي

    // Leftmost on screen is ي, the last letter in reading order.
    expect(glyphs[0].codePoints).toEqual([0x064a]);
    expect(glyphs.at(-1)?.codePoints).toEqual([0x062f]);
  });
});
