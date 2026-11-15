import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { type Font, openSync } from "fontkit";
import { stripHarakat } from "../lib/arabic";

type FontEntry = { key: string; path: string };

const FONTS: FontEntry[] = [
  { key: "amiri", path: "assets/fonts/amiri/Amiri-Regular.ttf" },
  {
    key: "noto",
    path: "assets/fonts/noto-naskh-arabic/NotoNaskhArabic-Regular.ttf",
  },
];
const OUT_DIR = "scripts/lab/out";

/** Font size used on the compare page, in CSS px. */
const COMPARE_FONT_SIZE = 120;
const ARABIC_FEATURES = [
  "isol",
  "init",
  "medi",
  "fina",
  "rlig",
  "liga",
  "mark",
  "mkmk",
];
const DIHLI = "دهلي";
const RIHLA = "رحلة";
const LA = "لا";
const SAMPLE = [DIHLI, RIHLA, LA].join(" ");
// دِهْلِي: دهلي with kasra and sukun, to check stripHarakat end to end.
const DIHLI_VOCALISED = "دِهْلِي";

const loadFont = (fontPath: string): Font => {
  const loadedFont = openSync(fontPath);

  if (!("layout" in loadedFont)) {
    throw new Error(`${fontPath} is a font collection`);
  }

  return loadedFont;
};

const printFontInfo = (font: Font) => {
  console.table({
    familyName: font.familyName,
    unitsPerEm: font.unitsPerEm,
    ascent: font.ascent,
    descent: font.descent,
  });
};

const printFeatures = (font: Font) => {
  const supported = font.availableFeatures.filter((feature) =>
    ARABIC_FEATURES.includes(feature),
  );
  const unique = [...new Set(supported)];

  // [ 'fina', 'init', 'liga', 'mark', 'medi', 'rlig', 'mkmk' ]
  console.log(unique);

  const missing = ARABIC_FEATURES.filter(
    (feature) => !supported.includes(feature),
  );

  // [ 'isol' ]
  console.log(missing);
};

const toHex = (codePoint: number) =>
  `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;

const printGlyphRun = (font: Font, text: string) => {
  const run = font.layout(text);
  console.log(`direction: ${run.direction}`); // rtl

  const result = run.glyphs.map(({ id, name, codePoints }, index) => {
    const [firstCodePoint] = codePoints;
    const { xAdvance, xOffset, yOffset } = run.positions[index];
    return {
      shapedId: id,
      nominalId:
        firstCodePoint === undefined
          ? "--"
          : (font.glyphForCodePoint(firstCodePoint)?.id ?? "Unknown"),
      name,
      codePoints: codePoints.map(toHex).join(" "),
      xAdvance,
      xOffset,
      yOffset,
    };
  });

  console.table(result);
};

const renderSvg = (font: Font, text: string) => {
  const run = font.layout(text);
  let penX = 0;

  const width = run.advanceWidth;
  const height = font.ascent - font.descent;

  const pathData = run.glyphs.map((glyph, index) => {
    const { xAdvance, xOffset, yOffset } = run.positions[index];

    const d = glyph.path
      .scale(1, -1)
      .translate(penX + xOffset, -yOffset)
      .toSVG();

    penX += xAdvance;
    return d;
  });

  const viewBox = `0 ${-font.ascent} ${width} ${height}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <path d="${pathData.join(" ")}" fill="black" />
</svg>`;
};

const saveFile = (content: string, fileName: string) => {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(`${OUT_DIR}/${fileName}`, content);
};

type CompareRow = {
  key: string;
  path: string;
  font: Font;
  svg: string;
};

/**
 * One row per font: the browser's own shaping (HarfBuzz) next to fontkit's SVG.
 * Each font gets its own `font-family` name; sharing one name would let the
 * last `@font-face` win, so every row would silently show the same font.
 */
const renderComparePage = (rows: CompareRow[], text: string) => {
  const familyOf = (key: string) => `Test-${key}`;

  const fontFaces = rows
    .map(({ key, path }) => {
      const base64 = readFileSync(path).toString("base64");
      return `  @font-face {
    font-family: "${familyOf(key)}";
    src: url(data:font/ttf;base64,${base64}) format("truetype");
  }`;
    })
    .join("\n");

  const rowsHtml = rows
    .map(({ key, font, svg }) => {
      // Size the SVG so one em matches the browser's font-size; both sides
      // then render the glyphs at exactly the same scale.
      const emHeight = (font.ascent - font.descent) / font.unitsPerEm;
      const svgHeight = Math.round(COMPARE_FONT_SIZE * emHeight);

      return `<section class="row">
  <h2>${font.familyName}</h2>
  <figure>
    <figcaption>Browser (HarfBuzz)</figcaption>
    <div class="text" lang="ar" dir="rtl" style="font-family: '${familyOf(key)}'; line-height: ${emHeight}">${text}</div>
  </figure>
  <figure>
    <figcaption>fontkit → SVG</figcaption>
    <div class="svg" style="height: ${svgHeight}px">${svg}</div>
  </figure>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en-GB">
<meta charset="utf-8" />
<title>Unit 01 – shaping comparison</title>
<style>
${fontFaces}
  body { font-family: system-ui; margin: 0; padding: 2rem 3rem; }
  /* Browser output on top, SVG below, both flush to the same edge, so each
     glyph lines up vertically with its counterpart. */
  .row { display: grid; gap: 1.5rem; justify-items: start; padding-block: 2rem; border-block-end: 1px solid #ddd; }
  h2 { font-size: 1.125rem; font-weight: 600; margin: 0; }
  figure { margin: 0; }
  figcaption { color: #666; font-size: 0.875rem; margin-block-end: 0.5rem; }
  .text { font-size: ${COMPARE_FONT_SIZE}px; white-space: nowrap; inline-size: max-content; }
  .svg svg { display: block; height: 100%; width: auto; }
</style>
${rowsHtml}
</html>
`;
};

const rows: CompareRow[] = FONTS.map(({ key, path }) => {
  const font = loadFont(path);

  printFontInfo(font);
  printFeatures(font);
  printGlyphRun(font, DIHLI);

  saveFile(renderSvg(font, DIHLI), `dihli-${key}.svg`);

  return { key, path, font, svg: renderSvg(font, SAMPLE) };
});

saveFile(renderComparePage(rows, SAMPLE), "compare.html");

// stripping harakat before shaping must give exactly the same outline
// as the unvocalised word.
const amiri = loadFont(FONTS[0].path);
const isSameOutline =
  renderSvg(amiri, stripHarakat(DIHLI_VOCALISED)) === renderSvg(amiri, DIHLI);
console.log(`stripHarakat keeps the outline identical: ${isSameOutline}`);
