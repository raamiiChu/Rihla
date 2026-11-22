import {
  Ar,
  Code,
  type Concept,
  type Pitfall,
  type Step,
  type Verification,
} from "@/app/lab/_components";
import type { Unit01Content } from "./types";

const STEPS: Step[] = [
  {
    id: "font-info",
    title: "Open the font and print its metrics and features",
    done: true,
  },
  {
    id: "glyph-run",
    title: (
      <>
        Shape <Ar>دهلي</Ar> and print each glyph
      </>
    ),
    done: true,
  },
  { id: "svg", title: "Output the result as SVG", done: true },
  { id: "compare", title: "Compare it with the browser's shaping", done: true },
  { id: "noto", title: "Compare it with Noto Naskh Arabic", done: true },
  {
    id: "harakat",
    title: "Strip the harakat (stripHarakat and its tests)",
    done: true,
  },
  {
    id: "extract",
    title: (
      <>
        Extract a proper module: <Code>scripts/lib/shape.ts</Code> and a
        characterisation test
      </>
    ),
    done: true,
  },
];

const CONCEPTS: Concept[] = [
  {
    title: "Shaping: one letter, several glyphs",
    body: (
      <>
        Depending on where it falls in a word, an Arabic letter has up to four
        forms: isolated, initial, medial and final. On top of that come
        ligatures and the marks stacked above or below. This is what{" "}
        <Code>font.layout(text)</Code> does, so the number of glyphs it returns
        need not match the number of characters.
      </>
    ),
  },
  {
    title: "Letters that only join to the right",
    body: (
      <>
        <Ar>ا د ذ ر ز و</Ar> join only to the letter before them, never to the
        one after. So on screen <Ar>دهلي</Ar> is really two pieces,{" "}
        <Ar>د｜هلي</Ar>: <Ar>د</Ar> keeps its isolated form (its id is
        unchanged), and <Ar>ه</Ar> becomes the initial form of the second piece.
        The gap between the two is correct.
      </>
    ),
  },
  {
    title: "Features and GSUB/GPOS",
    body: (
      <>
        <Code>init</Code>, <Code>medi</Code> and <Code>fina</Code> swap in the
        positional forms, <Code>rlig</Code> handles required ligatures, and{" "}
        <Code>mark</Code> and <Code>mkmk</Code> stack the marks. GSUB
        substitutes glyphs; GPOS adjusts their positions. fontkit merges the
        features of both tables, so the same tag can appear twice: remove the
        duplicates with a <Code>Set</Code>. A missing <Code>isol</Code> is
        normal, as the default glyph already is the isolated form.
      </>
    ),
  },
  {
    title: "Font coordinates: unitsPerEm, ascent, descent",
    body: (
      <>
        <Code>unitsPerEm</Code> is the number of units an em is divided into,
        and every glyph coordinate is expressed in these units.{" "}
        <Code>ascent</Code> and <Code>descent</Code> (negative) are the furthest
        extents above and below the baseline. Amiri is 1758 units tall, about
        1.8 em: Arabic calligraphy reaches much further up and down than Latin
        letters.
      </>
    ),
  },
  {
    title: "Flipping the Y axis",
    body: (
      <>
        Fonts follow the mathematical convention, with Y pointing up; SVG and
        screens descend from scan lines, with Y pointing down. Hence{" "}
        <Code>scale(1, -1)</Code>. After the flip, the upper half of the text
        sits at negative y, so the <Code>viewBox</Code> has to start at{" "}
        <Code>-ascent</Code>. Coordinates go through two stages: intermediate
        data uses SVG coordinates (Y down), matching SVG exported from Inkscape;
        before writing JSON, <Code>build-glyphs.ts</Code> flips everything back
        to Y up for three.js. The <Code>ascent</Code> and <Code>descent</Code>{" "}
        in <Code>ShapedText</Code> are still font coordinates, pointing the
        opposite way to the outlines.
      </>
    ),
  },
  {
    title: "Placing glyphs with a single pen",
    body: (
      <>
        The pen starts at x = 0. Each glyph is first scaled, then moved with{" "}
        <Code>translate(penX + xOffset, -yOffset)</Code>, and only then does the
        pen advance by <Code>xAdvance</Code>. The order matters: translate
        before flipping and the translation gets flipped as well.{" "}
        <Code>yOffset</Code> is in font coordinates, so its sign has to be
        flipped too.
      </>
    ),
  },
  {
    title: "The browser as the reference answer",
    body: (
      <>
        The browser's built-in shaping engine is HarfBuzz, the industry
        standard. The comparison page loads the same fonts with{" "}
        <Code>@font-face</Code>: the browser's text on top, fontkit's SVG below,
        both at the same em size so they can be compared glyph by glyph.
      </>
    ),
  },
  {
    title: "Fonts split glyphs differently",
    body: (
      <>
        Noto Naskh splits the final <Ar>ي</Ar> into a dotless body (
        <Code>uni0649.fina</Code>) plus a separate dot glyph. The dot glyph has
        an empty <Code>codePoints</Code> array and an <Code>xAdvance</Code> of
        0, and is put in place by <Code>xOffset</Code> and <Code>yOffset</Code>.
        Amiri draws the dots into the body. In both fonts <Ar>لا</Ar> is two
        glyphs (each swapped for its <Code>rlig</Code> shape), not a single
        ligature glyph.{" "}
        <strong>
          What this means for unit 10: sort the outlines right to left by their
          actual position (the bbox x), not by their index in the glyph array.
        </strong>
      </>
    ),
  },
];

const PITFALLS: Pitfall[] = [
  {
    title: "glyph.name is always undefined",
    symptom: (
      <>
        Even the default glyph from <Code>glyphForCodePoint()</Code> has no
        name.
      </>
    ),
    cause: (
      <>
        Amiri's <Code>post</Code> table is version 3, which by design stores no
        glyph names.
      </>
    ),
    fix: (
      <>
        Compare ids instead: when <Code>glyph.id</Code> differs from{" "}
        <Code>font.glyphForCodePoint(cp).id</Code>, shaping has swapped in a
        positional form.
      </>
    ),
  },
  {
    title: "codePoints[0] may not exist, and TypeScript stays silent",
    symptom: (
      <>
        When <Code>codePoints</Code> is empty, the lookup returns id 0,{" "}
        <Code>.notdef</Code>, which looks like any other number.
      </>
    ),
    cause: (
      <>
        By default, indexing a <Code>number[]</Code> gives <Code>number</Code>,
        without <Code>undefined</Code> (unless{" "}
        <Code>noUncheckedIndexedAccess</Code> is on).
      </>
    ),
    fix: (
      <>
        Destructure first with <Code>const [firstCodePoint] = codePoints</Code>{" "}
        and check for <Code>undefined</Code> before the lookup.
      </>
    ),
  },
  {
    title:
      "Opened from the file manager, the comparison page ignores the fonts",
    symptom:
      "The browser side falls back to the system font and looks as if the shaping were wrong.",
    cause: (
      <>
        When an HTML file is opened over <Code>file://</Code>, some browsers
        block fonts loaded by relative path.
      </>
    ),
    fix: (
      <>
        Read the fonts as base64 and embed them in <Code>@font-face</Code> as{" "}
        <Code>data:font/ttf;base64,…</Code>.
      </>
    ),
  },
  {
    title: "Both fonts' comparison rows show the same font",
    symptom: "The browser text in the Amiri and Noto rows looks identical.",
    cause: (
      <>
        Several <Code>@font-face</Code> rules shared one{" "}
        <Code>font-family</Code> name, so the last one overrode the others.
      </>
    ),
    fix: (
      <>
        Give each font a unique name, such as <Code>Test-amiri</Code> and{" "}
        <Code>Test-noto</Code>.
      </>
    ),
  },
  {
    title: "The two sides of the comparison page differ in size",
    symptom:
      "The browser text and the SVG come out at different sizes and cannot be lined up.",
    cause: (
      <>
        CSS <Code>font-size</Code> is the size of one em, but the SVG is ascent
        − descent tall: the two use different units.
      </>
    ),
    fix: (
      <>
        Set the SVG height to{" "}
        <Code>font-size × (ascent − descent) / unitsPerEm</Code>, and give the
        text a <Code>line-height</Code> of the same ratio.
      </>
    ),
  },
];

const VERIFICATIONS: Verification[] = [
  {
    id: "run",
    body: (
      <>
        Run <Code>pnpm lab:01</Code> and open{" "}
        <Code>scripts/lab/out/dihli-amiri.svg</Code>: <Ar>د</Ar> is rightmost
        and the text is not upside down.
      </>
    ),
  },
  {
    id: "viewbox",
    body: (
      <>
        The SVG's <Code>viewBox</Code> should be <Code>0 -1124 1566 1758</Code>:
        the width is <Code>run.advanceWidth</Code> (469 + 195 + 452 + 450 =
        1566) and the height is <Code>font.ascent - font.descent</Code> (1124 −
        (−634) = 1758).
      </>
    ),
  },
  {
    id: "compare",
    body: (
      <>
        Open <Code>scripts/lab/out/compare.html</Code> and compare the browser
        (HarfBuzz) with fontkit glyph by glyph on <Ar>دهلي رحلة لا</Ar>: the
        joining, the glyph forms and the dot positions all match.
      </>
    ),
  },
  {
    id: "test",
    body: (
      <>
        Run <Code>pnpm test</Code>: <Code>scripts/lib/shape.test.ts</Code>{" "}
        passes, pinning down fontkit 3.0.0's visual-order behaviour.
      </>
    ),
  },
  {
    id: "harakat",
    body: (
      <>
        The last line of <Code>pnpm lab:01</Code> prints{" "}
        <Code>stripHarakat keeps the outline identical: true</Code>.
      </>
    ),
  },
];

const CONCLUSIONS: Verification[] = [
  {
    id: "visual-order",
    body: (
      <>
        fontkit returns <Code>glyphs</Code> in <strong>visual order</strong>:
        index 0 is <Ar>ي</Ar>, the leftmost glyph on screen, so the pen simply
        moves right from x = 0.
      </>
    ),
  },
  {
    id: "matches-browser",
    body: (
      <>
        With both fonts, <Ar>دهلي رحلة لا</Ar> matches the browser (HarfBuzz),
        including the dots that Noto places with offsets. fontkit is fit for
        this project.
      </>
    ),
  },
  {
    id: "amiri",
    body: (
      <>
        <strong>Amiri is adopted</strong>: it matches the font of the DOM
        quotations, and its classical Naskh style, based on the Bulaq press
        type, suits the 14th-century subject. The neon-tube outline effect will
        be checked again in unit 10.
      </>
    ),
  },
  {
    id: "module",
    body: (
      <>
        The shaping logic now lives in <Code>scripts/lib/shape.ts</Code>:{" "}
        <Code>layoutText</Code> returns plain data in SVG coordinates (one{" "}
        <Code>d</Code> per glyph), ready for unit 10.
      </>
    ),
  },
];

const CONTENT: Unit01Content = {
  intro: (
    <>
      Checking whether fontkit can shape Arabic correctly, the biggest technical
      risk in the whole project. Alongside is <Ar>دهلي</Ar> shaped with Amiri;
      dashed lines mark each glyph's position and xAdvance.
    </>
  ),
  demoCaption: (
    <>
      <Ar>دهلي</Ar> shaped with Amiri, marking the font metrics and each glyph's
      xAdvance.
    </>
  ),
  diagramTitle:
    "دهلي as shaped by fontkit, marking the ascent, baseline, descent and each glyph's xAdvance.",
  steps: STEPS,
  conclusions: { title: "Conclusions so far", items: CONCLUSIONS },
  measurements: {
    title: "Measurements",
    metricCaption: "Font metrics",
    glyphCaption: (
      <>
        Each glyph of <Ar>دهلي</Ar> as shaped with Amiri
      </>
    ),
    columns: {
      font: "Font",
      letter: "Letter",
      codePoint: "Code point",
      form: "Form",
    },
    adopted: " (adopted)",
    forms: {
      isolated: "Isolated",
      initial: "Initial",
      medial: "Medial",
      final: "Final",
    },
  },
  concepts: CONCEPTS,
  pitfalls: PITFALLS,
  verifications: VERIFICATIONS,
};

export default CONTENT;
