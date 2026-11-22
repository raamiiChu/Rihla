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
const GlyphDiagram = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center p-6 lg:p-12">
    <svg
      viewBox={viewBox}
      role="img"
      aria-labelledby="glyph-diagram-title"
      className="h-auto max-h-full w-full"
    >
      <title id="glyph-diagram-title">{title}</title>

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
                ? "stroke-muted-foreground"
                : "stroke-muted-foreground/40"
            }
            strokeDasharray={guide.id === "baseline" ? undefined : "4 6"}
          />
          <text
            x={-PADDING + 12}
            y={guide.y - 16}
            className="fill-muted-foreground"
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
          className="stroke-gold/60"
          strokeDasharray="2 6"
        />
      ))}

      <path d={DIHLI_PATH} className="fill-parchment" />

      {DIHLI_GLYPHS.map((glyph, position) => {
        const centre = (penStops[position] + penStops[position + 1]) / 2;

        return (
          <g
            key={glyph.codePoint}
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            <text x={centre} y={-descent + 110} fontSize={96} lang="ar">
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
