import type { FlowLayout } from "./FlowChart";

// Three columns: a gutter for the loop back on the left, the main flow, and a
// side column for branches that leave it.
const MAIN = { x: 36, w: 260, cx: 166 } as const;
const SIDE = { x: 312, w: 120, cx: 372 } as const;
const WIDTH = 440;

const down = (from: number, to: number): [number, number][] => [
  [MAIN.cx, from],
  [MAIN.cx, to],
];

const RESAMPLE_LAYOUT: FlowLayout = {
  width: WIDTH,
  height: 682,
  nodes: [
    { kind: "terminal", label: "start", x: MAIN.x, y: 8, w: MAIN.w, h: 30 },
    { kind: "decision", label: "valid", x: 91, y: 56, w: 150, h: 56 },
    { kind: "error", label: "error", x: SIDE.x, y: 64, w: SIDE.w, h: 40 },
    { kind: "process", label: "table", x: MAIN.x, y: 132, w: MAIN.w, h: 59 },
    { kind: "decision", label: "positive", x: 106, y: 209, w: 120, h: 50 },
    { kind: "error", label: "error", x: SIDE.x, y: 214, w: SIDE.w, h: 40 },
    { kind: "process", label: "sourceT", x: MAIN.x, y: 277, w: MAIN.w, h: 30 },
    { kind: "process", label: "spacing", x: MAIN.x, y: 325, w: MAIN.w, h: 44 },
    { kind: "process", label: "target", x: MAIN.x, y: 387, w: MAIN.w, h: 30 },
    { kind: "decision", label: "beyond", x: 66, y: 435, w: 200, h: 60 },
    {
      kind: "process",
      label: "nextSegment",
      x: SIDE.x,
      y: 445,
      w: SIDE.w,
      h: 40,
    },
    {
      kind: "process",
      label: "interpolate",
      x: MAIN.x,
      y: 513,
      w: MAIN.w,
      h: 44,
    },
    { kind: "decision", label: "more", x: 91, y: 575, w: 150, h: 50 },
    { kind: "terminal", label: "done", x: MAIN.x, y: 643, w: MAIN.w, h: 30 },
  ],
  edges: [
    { points: down(38, 56) },
    {
      points: [
        [241, 84],
        [SIDE.x, 84],
      ],
      label: { label: "no", x: 276, y: 76 },
    },
    {
      points: down(112, 132),
      label: { label: "yes", x: 174, y: 122, anchor: "start" },
    },
    { points: down(191, 209) },
    {
      points: [
        [226, 234],
        [SIDE.x, 234],
      ],
      label: { label: "no", x: 269, y: 226 },
    },
    {
      points: down(259, 277),
      label: { label: "yes", x: 174, y: 268, anchor: "start" },
    },
    { points: down(307, 325) },
    { points: down(369, 387) },
    { points: down(417, 435) },
    {
      points: [
        [266, 465],
        [SIDE.x, 465],
      ],
      label: { label: "yes", x: 289, y: 457 },
    },
    // Back up to the same check with the next segment.
    {
      points: [
        [SIDE.cx, 445],
        [SIDE.cx, 426],
        [MAIN.cx + 6, 426],
      ],
    },
    {
      points: down(495, 513),
      label: { label: "no", x: 174, y: 504, anchor: "start" },
    },
    { points: down(557, 575) },
    // Back up to the next sample.
    {
      points: [
        [91, 600],
        [16, 600],
        [16, 402],
        [MAIN.x, 402],
      ],
      label: { label: "yes", x: 54, y: 592 },
    },
    {
      points: down(625, 643),
      label: { label: "no", x: 174, y: 634, anchor: "start" },
    },
  ],
};

const NEAREST_LAYOUT: FlowLayout = {
  width: WIDTH,
  height: 306,
  nodes: [
    { kind: "terminal", label: "start", x: MAIN.x, y: 8, w: MAIN.w, h: 30 },
    { kind: "decision", label: "valid", x: 91, y: 56, w: 150, h: 56 },
    { kind: "error", label: "error", x: SIDE.x, y: 64, w: SIDE.w, h: 40 },
    { kind: "process", label: "index", x: MAIN.x, y: 132, w: MAIN.w, h: 44 },
    { kind: "decision", label: "wrap", x: 86, y: 194, w: 160, h: 56 },
    { kind: "terminal", label: "zero", x: SIDE.x, y: 202, w: SIDE.w, h: 40 },
    { kind: "terminal", label: "done", x: MAIN.x, y: 268, w: MAIN.w, h: 30 },
  ],
  edges: [
    { points: down(38, 56) },
    {
      points: [
        [241, 84],
        [SIDE.x, 84],
      ],
      label: { label: "no", x: 276, y: 76 },
    },
    {
      points: down(112, 132),
      label: { label: "yes", x: 174, y: 122, anchor: "start" },
    },
    { points: down(176, 194) },
    {
      points: [
        [246, 222],
        [SIDE.x, 222],
      ],
      label: { label: "yes", x: 279, y: 214 },
    },
    {
      points: down(250, 268),
      label: { label: "no", x: 174, y: 259, anchor: "start" },
    },
  ],
};

type ResampleFlowLabel =
  | "start"
  | "valid"
  | "error"
  | "table"
  | "positive"
  | "sourceT"
  | "spacing"
  | "target"
  | "beyond"
  | "nextSegment"
  | "interpolate"
  | "more"
  | "done"
  | "yes"
  | "no";

type NearestFlowLabel =
  | "start"
  | "valid"
  | "error"
  | "index"
  | "wrap"
  | "zero"
  | "done"
  | "yes"
  | "no";

export type { NearestFlowLabel, ResampleFlowLabel };
export { NEAREST_LAYOUT, RESAMPLE_LAYOUT };
