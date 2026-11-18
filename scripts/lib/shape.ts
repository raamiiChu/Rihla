import { type Font, openSync } from "fontkit";

export type PositionedGlyph = {
  /**
   * Outline in font units and SVG coordinates (Y-down: the baseline is at
   * y = 0 and negative y is above it), already moved to its pen position.
   * This matches Inkscape's SVG output, so both sources share one coordinate
   * system until `build-glyphs.ts` flips them back to Y-up for three.js.
   */
  d: string;
  /** Empty for glyphs that represent no character, e.g. a detached dot. */
  codePoints: number[];
};

/**
 * Shaped text ready to sample. The metrics stay in the font's own coordinates
 * (Y-up) while `glyphs[].d` is Y-down, so in the outlines the text spans
 * y = -ascent to y = -descent.
 */
export type ShapedText = {
  glyphs: PositionedGlyph[];
  advanceWidth: number;
  /** Font coordinates, Y-up: positive, above the baseline. */
  ascent: number;
  /** Font coordinates, Y-up: usually negative, below the baseline. */
  descent: number;
  unitsPerEm: number;
};

export const loadFont = (fontPath: string): Font => {
  const loadedFont = openSync(fontPath);

  if (!("layout" in loadedFont)) {
    throw new Error(`${fontPath} is a font collection`);
  }

  return loadedFont;
};

export const layoutText = (font: Font, text: string): ShapedText => {
  const run = font.layout(text);
  const { ascent, descent, unitsPerEm } = font;
  let penX = 0;

  const glyphs = run.glyphs.map((glyph, index) => {
    const { xAdvance, xOffset, yOffset } = run.positions[index];
    // Flip to SVG coordinates first, so the offset must flip with it.
    const d = glyph.path
      .scale(1, -1)
      .translate(penX + xOffset, -yOffset)
      .toSVG();
    penX += xAdvance;
    return { d, codePoints: glyph.codePoints };
  });

  return {
    glyphs,
    advanceWidth: run.advanceWidth,
    ascent,
    descent,
    unitsPerEm,
  };
};
