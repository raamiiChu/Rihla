type UnitStatus = "done" | "in-progress" | "todo";

type Unit = {
  id: string;
  title: string;
  phase: Phase;
  /** `script` units live under `scripts/` and have no page. */
  kind: "page" | "script";
  status: UnitStatus;
};

const PHASES = {
  1: "基礎",
  2: "地球",
  4: "完成",
} as const;

type Phase = keyof typeof PHASES;

const UNITS: Unit[] = [
  { id: "00", title: "建立練習場", phase: 1, kind: "page", status: "done" },
  {
    id: "01",
    title: "fontkit 書法腳本（風險驗證）",
    phase: 1,
    kind: "script",
    status: "todo",
  },
  {
    id: "02",
    title: "zustand 與 Lenis",
    phase: 1,
    kind: "page",
    status: "todo",
  },
  {
    id: "03",
    title: "R3F 更新迴圈與 Lenis 交接",
    phase: 1,
    kind: "page",
    status: "todo",
  },
  { id: "04", title: "曲線與鏡頭軌道", phase: 1, kind: "page", status: "todo" },
  {
    id: "05",
    title: "迷你時間軸與 SKIP",
    phase: 1,
    kind: "page",
    status: "todo",
  },
  {
    id: "06",
    title: "文字層動畫（Motion）",
    phase: 1,
    kind: "page",
    status: "todo",
  },
  { id: "07", title: "依弧長重新取樣", phase: 1, kind: "page", status: "todo" },
  { id: "08", title: "形變與起點對齊", phase: 1, kind: "page", status: "todo" },
  {
    id: "09",
    title: "Line2 與手動寫入 buffer",
    phase: 2,
    kind: "page",
    status: "todo",
  },
  { id: "10", title: "書法取點與形變", phase: 2, kind: "page", status: "todo" },
  {
    id: "11",
    title: "Additive、頂點顏色與點",
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "12",
    title: "Postprocessing 與 Bloom",
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "13",
    title: "線寬模式與 shader 預熱",
    phase: 2,
    kind: "page",
    status: "todo",
  },
  {
    id: "14",
    title: "點陣地球與大圓弧",
    phase: 2,
    kind: "page",
    status: "todo",
  },
  { id: "15", title: "Shader 點雲", phase: 2, kind: "page", status: "todo" },
  { id: "16", title: "減少動態效果", phase: 4, kind: "page", status: "todo" },
];

export type { Phase, Unit, UnitStatus };
export { PHASES, UNITS };
