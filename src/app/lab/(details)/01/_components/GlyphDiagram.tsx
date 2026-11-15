import { AMIRI_METRICS, DIHLI_GLYPHS, DIHLI_PATH } from "./dihli";

const { ascent, descent } = AMIRI_METRICS;

// Pen position before each glyph: 0, then a running total of xAdvance.
let penX = 0;
const penStops = [
  0,
  ...DIHLI_GLYPHS.map((glyph) => {
    penX += glyph.xAdvance;
    return penX;
  }),
];
const width = penX;

const PADDING = 80;
const LABEL_SPACE = 260;
const viewBox = [
  -PADDING,
  -ascent - PADDING,
  width + PADDING * 2,
  ascent - descent + PADDING + LABEL_SPACE,
].join(" ");

const GUIDES = [
  { id: "ascent", y: -ascent, label: `ascent ${ascent}` },
  { id: "baseline", y: 0, label: "baseline 0" },
  { id: "descent", y: -descent, label: `descent ${descent}` },
];

/**
 * دهلي as shaped by fontkit, with the font metrics and the pen stops that
 * place each glyph. Coordinates are font units in SVG's y-down axis.
 */
const GlyphDiagram = () => (
  <div className="flex h-full items-center justify-center p-6 lg:p-12">
    <svg
      viewBox={viewBox}
      role="img"
      aria-labelledby="glyph-diagram-title"
      className="h-auto max-h-full w-full bg-white"
    >
      <title id="glyph-diagram-title">
        دهلي 的排版結果，標出 ascent、基線、descent 與每個字形的 xAdvance。
      </title>

      {GUIDES.map((guide) => (
        <g key={guide.id}>
          <line
            x1={-PADDING}
            x2={width + PADDING}
            y1={guide.y}
            y2={guide.y}
            vectorEffect="non-scaling-stroke"
            className={
              guide.id === "baseline"
                ? "stroke-neutral-500"
                : "stroke-neutral-300"
            }
            strokeDasharray={guide.id === "baseline" ? undefined : "4 6"}
          />
          <text
            x={-PADDING + 12}
            y={guide.y - 16}
            className="fill-neutral-600 font-mono"
            fontSize={36}
          >
            {guide.label}
          </text>
        </g>
      ))}

      {penStops.map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={-ascent}
          y2={-descent}
          vectorEffect="non-scaling-stroke"
          className="stroke-sky-500/70"
          strokeDasharray="2 6"
        />
      ))}

      <path d={DIHLI_PATH} className="fill-black" />

      {DIHLI_GLYPHS.map((glyph, position) => {
        const centre = (penStops[position] + penStops[position + 1]) / 2;

        return (
          <g
            key={glyph.codePoint}
            className="fill-neutral-600"
            textAnchor="middle"
          >
            <text x={centre} y={-descent + 110} fontSize={72} lang="ar">
              {glyph.letter}
            </text>
            <text
              x={centre}
              y={-descent + 190}
              fontSize={36}
              className="font-mono"
            >
              {`[${position}] ${glyph.xAdvance}`}
            </text>
          </g>
        );
      })}
    </svg>
  </div>
);

export default GlyphDiagram;
