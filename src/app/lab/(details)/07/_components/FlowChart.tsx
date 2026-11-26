import { useId } from "react";

type NodeKind = "terminal" | "process" | "decision" | "error";

type FlowNode = {
  kind: NodeKind;
  /** Key into the chart's labels; several nodes may share one. */
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type EdgeLabel = {
  label: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  /** Turns the text to run up the page, for labels beside a vertical edge. */
  vertical?: boolean;
};

type FlowEdge = {
  /** Polyline points; the arrowhead sits on the last one. */
  points: [number, number][];
  label?: EdgeLabel;
};

type FlowLayout = {
  width: number;
  height: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

/** Each label is a list of lines: SVG text does not wrap on its own. */
type FlowLabels = Record<string, string[]>;

const FONT_SIZE = 12;
const LINE_HEIGHT = 15;

const NODE_CLASS: Record<NodeKind, string> = {
  terminal: "fill-muted/60 stroke-gold",
  process: "fill-muted/40 stroke-border",
  decision: "fill-muted/40 stroke-gold/60",
  error: "fill-destructive/10 stroke-destructive/70",
};

const Shape = ({ kind, x, y, w, h }: FlowNode) => {
  const className = NODE_CLASS[kind];

  if (kind === "decision") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    return (
      <polygon
        points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
        className={className}
      />
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={kind === "terminal" ? h / 2 : 4}
      className={className}
    />
  );
};

/** Lines centred on (x, y), one line height apart. */
const Lines = ({
  lines,
  x,
  y,
  anchor = "middle",
  className,
}: {
  lines: string[];
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  className: string;
}) => (
  <text
    x={x}
    textAnchor={anchor}
    dominantBaseline="central"
    fontSize={FONT_SIZE}
    className={className}
  >
    {lines.map((line, index) => (
      <tspan
        // Lines are fixed per label and never reorder.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        key={index}
        x={x}
        y={y + (index - (lines.length - 1) / 2) * LINE_HEIGHT}
      >
        {line}
      </tspan>
    ))}
  </text>
);

type FlowChartProps = {
  title: string;
  layout: FlowLayout;
  labels: FlowLabels;
};

/**
 * A flowchart drawn from a fixed layout. Coordinates live with the chart, the
 * words come in as `labels`, so both locales share one layout.
 */
const FlowChart = ({ title, layout, labels }: FlowChartProps) => {
  const id = useId();
  const titleId = `${id}-title`;
  const arrowId = `${id}-arrow`;

  return (
    <figure className="space-y-2">
      <figcaption className="text-sm text-muted-foreground">{title}</figcaption>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-labelledby={titleId}
        className="h-auto w-full max-w-xl"
      >
        <title id={titleId}>{title}</title>
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
          </marker>
        </defs>

        {layout.edges.map((edge) => (
          <g key={edge.points.join(" ")}>
            <polyline
              points={edge.points.join(" ")}
              fill="none"
              markerEnd={`url(#${arrowId})`}
              className="stroke-muted-foreground"
            />
            {edge.label && (
              <g
                transform={
                  edge.label.vertical
                    ? `rotate(-90 ${edge.label.x} ${edge.label.y})`
                    : undefined
                }
              >
                <Lines
                  lines={labels[edge.label.label]}
                  x={edge.label.x}
                  y={edge.label.y}
                  anchor={edge.label.anchor}
                  className="fill-muted-foreground"
                />
              </g>
            )}
          </g>
        ))}

        {layout.nodes.map((node) => (
          <g key={`${node.x},${node.y}`}>
            <Shape {...node} />
            <Lines
              lines={labels[node.label]}
              x={node.x + node.w / 2}
              y={node.y + node.h / 2}
              className="fill-parchment"
            />
          </g>
        ))}
      </svg>
    </figure>
  );
};

export type { FlowLabels, FlowLayout };
export default FlowChart;
