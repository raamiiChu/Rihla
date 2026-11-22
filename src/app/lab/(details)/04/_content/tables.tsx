import type { ReactNode } from "react";
import type { Column } from "@/app/lab/_components";
import type {
  GateId,
  LayoutId,
  LevellingId,
  LineId,
  RotationId,
  Unit04Content,
} from "./types";

type Tables = Unit04Content["tables"];

/** Measured on WAVE_CURVE; the same in every locale. */
const SEGMENTS = [
  { id: "0-1", segment: "0 → 1", length: "6.2" },
  { id: "1-2", segment: "1 → 2", length: "11.5" },
  { id: "2-3", segment: "2 → 3", length: "13.2" },
  { id: "3-4", segment: "3 → 4", length: "4.9" },
  { id: "4-5", segment: "4 → 5", length: "13.5" },
  { id: "5-6", segment: "5 → 6", length: "3.3" },
  { id: "6-7", segment: "6 → 7", length: "15.4" },
];

const LINES: LineId[] = ["three-line", "drei-line", "line2"];

const ROTATIONS: { id: RotationId; size: number }[] = [
  { id: "euler", size: 3 },
  { id: "matrix", size: 9 },
  { id: "quaternion", size: 4 },
];

const LAYOUT: { id: LayoutId; offset: number; size: number }[] = [
  { id: "position", offset: 0, size: 3 },
  { id: "tangent", offset: 3, size: 3 },
  { id: "up", offset: 6, size: 3 },
];

const GATES: GateId[] = ["distance", "vertical", "upright"];

/** Measured on LOOP_CURVE with a levelling rate of 0.1. */
const LEVELLING_RESULTS: {
  id: LevellingId;
  exitTilt: string;
  sampleDifference: string;
}[] = [
  { id: "none", exitTilt: "41.1°", sampleDifference: "0.014°" },
  { id: "vertical-only", exitTilt: "16.5°", sampleDifference: "153°" },
  { id: "both", exitTilt: "0.27°", sampleDifference: "0.008°" },
];

type SegmentRow = { id: string; segment: string; length: string };

const getSegmentTable = ({ segment }: Tables) => {
  const columns: Column<SegmentRow>[] = [
    { key: "segment", label: segment.columns.segment },
    { key: "length", label: segment.columns.length, numeric: true },
  ];

  return { caption: segment.caption, columns, rows: SEGMENTS };
};

type LineRow = {
  id: string;
  approach: ReactNode;
  underlying: ReactNode;
  width: string;
  disposal: string;
  usedFor: string;
};

const getLineTable = ({ line }: Tables) => {
  const columns: Column<LineRow>[] = [
    { key: "approach", label: line.columns.approach },
    { key: "underlying", label: line.columns.underlying },
    { key: "width", label: line.columns.width },
    { key: "disposal", label: line.columns.disposal },
    { key: "usedFor", label: line.columns.usedFor },
  ];

  const rows: LineRow[] = LINES.map((id) => ({ id, ...line.rows[id] }));

  return { caption: line.caption, columns, rows };
};

type RotationRow = {
  id: string;
  representation: ReactNode;
  size: number;
  tradeoff: ReactNode;
  usedFor: ReactNode;
};

const getRotationTable = ({ rotation }: Tables) => {
  const columns: Column<RotationRow>[] = [
    { key: "representation", label: rotation.columns.representation },
    { key: "size", label: rotation.columns.size, numeric: true },
    { key: "tradeoff", label: rotation.columns.tradeoff },
    { key: "usedFor", label: rotation.columns.usedFor },
  ];

  const rows: RotationRow[] = ROTATIONS.map(({ id, size }) => {
    const text = rotation.rows[id];

    return {
      id,
      size,
      representation: text.representation,
      tradeoff: (
        <>
          <span className="block">
            {rotation.pro}
            {text.pro}
          </span>
          <span className="block">
            {rotation.con}
            {text.con}
          </span>
        </>
      ),
      usedFor: text.usedFor,
    };
  });

  return { caption: rotation.caption, columns, rows };
};

type LayoutRow = {
  id: string;
  field: string;
  offset: number;
  size: number;
  purpose: string;
};

const getLayoutTable = ({ layout }: Tables) => {
  const columns: Column<LayoutRow>[] = [
    { key: "field", label: layout.columns.field },
    { key: "offset", label: layout.columns.offset, numeric: true },
    { key: "size", label: layout.columns.size, numeric: true },
    { key: "purpose", label: layout.columns.purpose },
  ];

  const rows: LayoutRow[] = LAYOUT.map((row) => ({
    ...row,
    field: row.id,
    purpose: layout.purpose[row.id],
  }));

  return { caption: layout.caption, columns, rows };
};

type GateRow = {
  id: string;
  factor: string;
  question: string;
  formula: ReactNode;
  full: string;
  none: string;
};

const getGateTable = ({ gate }: Tables) => {
  const columns: Column<GateRow>[] = [
    { key: "factor", label: gate.columns.factor },
    { key: "question", label: gate.columns.question },
    { key: "formula", label: gate.columns.formula },
    { key: "full", label: gate.columns.full },
    { key: "none", label: gate.columns.none },
  ];

  const rows: GateRow[] = GATES.map((id) => ({ id, ...gate.rows[id] }));

  return { caption: gate.caption, columns, rows };
};

type LevellingRow = {
  id: string;
  version: string;
  exitTilt: string;
  sampleDifference: string;
  top: string;
};

const getLevellingTable = ({ levelling }: Tables) => {
  const columns: Column<LevellingRow>[] = [
    { key: "version", label: levelling.columns.version },
    { key: "exitTilt", label: levelling.columns.exitTilt, numeric: true },
    {
      key: "sampleDifference",
      label: levelling.columns.sampleDifference,
      numeric: true,
    },
    { key: "top", label: levelling.columns.top },
  ];

  const rows: LevellingRow[] = LEVELLING_RESULTS.map((row) => ({
    ...row,
    ...levelling.rows[row.id],
  }));

  return { caption: levelling.caption, columns, rows };
};

export {
  getGateTable,
  getLayoutTable,
  getLevellingTable,
  getLineTable,
  getRotationTable,
  getSegmentTable,
};
