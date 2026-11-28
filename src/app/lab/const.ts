import type { Localised } from "./_i18n";

type UnitStatus = "done" | "in-progress" | "todo";

type Unit = {
  id: string;
  title: Localised<string>;
  phase: Phase;
  /** Where the practice code lives: a `/lab` page, or `scripts/` (notes page only). */
  kind: "page" | "script";
  status: UnitStatus;
};

const PHASES = {
  1: { "zh-TW": "基礎", "en-GB": "Foundations" },
  2: { "zh-TW": "地球", "en-GB": "The globe" },
  4: { "zh-TW": "完成", "en-GB": "Finishing" },
} as const satisfies Record<number, Localised<string>>;

type Phase = keyof typeof PHASES;

const UNITS: Unit[] = [
  {
    id: "00",
    title: { "zh-TW": "建立練習場", "en-GB": "Setting up the lab" },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "01",
    title: {
      "zh-TW": "fontkit 書法腳本（風險驗證）",
      "en-GB": "fontkit calligraphy script (risk check)",
    },
    phase: 1,
    kind: "script",
    status: "done",
  },
  {
    id: "02",
    title: { "zh-TW": "zustand 與 Lenis", "en-GB": "zustand and Lenis" },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "03",
    title: {
      "zh-TW": "R3F 更新迴圈與 Lenis 交接",
      "en-GB": "The R3F update loop and the Lenis handoff",
    },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "04",
    title: { "zh-TW": "曲線與鏡頭軌道", "en-GB": "Curves and the camera rail" },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "05",
    title: {
      "zh-TW": "迷你時間軸與 SKIP",
      "en-GB": "A mini timeline and SKIP",
    },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "06",
    title: {
      "zh-TW": "文字層動畫（Motion）",
      "en-GB": "Text layer animation (Motion)",
    },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "07",
    title: { "zh-TW": "依弧長重新取樣", "en-GB": "Resampling by arc length" },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "08",
    title: {
      "zh-TW": "形變與起點對齊",
      "en-GB": "Morphing and start-point alignment",
    },
    phase: 1,
    kind: "page",
    status: "done",
  },
  {
    id: "09",
    title: {
      "zh-TW": "Line2 與手動寫入 buffer",
      "en-GB": "Line2 and writing buffers by hand",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "10",
    title: {
      "zh-TW": "書法取點與形變",
      "en-GB": "Sampling and morphing the calligraphy",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "11",
    title: {
      "zh-TW": "Additive、頂點顏色與點",
      "en-GB": "Additive blending, vertex colours and points",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "12",
    title: {
      "zh-TW": "Postprocessing 與 Bloom",
      "en-GB": "Postprocessing and Bloom",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "13",
    title: {
      "zh-TW": "線寬模式與 shader 預熱",
      "en-GB": "Line width modes and shader warm-up",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "14",
    title: {
      "zh-TW": "點陣地球與大圓弧",
      "en-GB": "The dotted globe and great-circle arcs",
    },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "15",
    title: { "zh-TW": "Shader 點雲", "en-GB": "Shader point clouds" },
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "16",
    title: { "zh-TW": "減少動態效果", "en-GB": "Reduced motion" },
    phase: 4,
    kind: "page",
    status: "todo",
  },
];

const CANVAS_BG_COLOR = "#07080d" as const;
export const GOLD_COLOR = "#d9b26a" as const;

export type { Phase, Unit, UnitStatus };
export { CANVAS_BG_COLOR, PHASES, UNITS };
