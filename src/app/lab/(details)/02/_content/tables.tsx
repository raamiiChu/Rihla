import type { ReactNode } from "react";
import { Code, type Column } from "@/app/lab/_components";
import type { ReadId, RenderId, Unit02Content } from "./types";

type ReadRow = {
  id: ReadId;
  syntax: ReactNode;
  rerender: string;
  usage: string;
};

type RenderRow = {
  id: RenderId;
  component: string;
  read: ReactNode;
  highlight: string;
  log: string;
};

/** The code is the same in every locale; only the descriptions change. */
const READ_SYNTAX: Record<ReadId, ReactNode> = {
  selector: <Code>{"useScrollStore((s) => s.stationIndex)"}</Code>,
  "get-state": <Code>useScrollStore.getState().progress</Code>,
  set: <Code>{"getState().setProgress(…)"}</Code>,
};

const RENDER_READS: Record<RenderId, { component: string; read: ReactNode }> = {
  station: {
    component: "StationReadout",
    read: <Code>{"(s) => s.stationIndex"}</Code>,
  },
  progress: {
    component: "ProgressReadout",
    read: <Code>getState() + rAF</Code>,
  },
  wrong: {
    component: "ProgressReadoutWrong",
    read: <Code>{"(s) => s.progress"}</Code>,
  },
};

const getReadTable = (table: Unit02Content["readTable"]) => {
  const columns: Column<ReadRow>[] = [
    { key: "syntax", label: table.columns.syntax },
    { key: "rerender", label: table.columns.rerender },
    { key: "usage", label: table.columns.usage },
  ];

  const ids: ReadId[] = ["selector", "get-state", "set"];
  const rows: ReadRow[] = ids.map((id) => ({
    id,
    syntax: READ_SYNTAX[id],
    ...table.rows[id],
  }));

  return { columns, rows };
};

const getRenderTable = (table: Unit02Content["renderTable"]) => {
  const columns: Column<RenderRow>[] = [
    { key: "component", label: table.columns.component },
    { key: "read", label: table.columns.read },
    { key: "highlight", label: "Highlight updates" },
    { key: "log", label: "render log" },
  ];

  const ids: RenderId[] = ["station", "progress", "wrong"];
  const rows: RenderRow[] = ids.map((id) => ({
    id,
    ...RENDER_READS[id],
    ...table.rows[id],
  }));

  return { columns, rows };
};

export { getReadTable, getRenderTable };
