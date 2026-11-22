import type { ReactNode } from "react";
import { Code, type Column } from "@/app/lab/_components";
import type { Unit05Content } from "./types";

type RangeRow = {
  id: string;
  station: ReactNode;
  weights: string;
  flightStart: string;
  flightEnd: string;
  dwellEnd: string;
  rail: string;
};

/** The demo timeline's numbers are the same in every locale. */
const RANGE_ROWS: RangeRow[] = [
  {
    id: "tangier",
    station: <Code>tangier</Code>,
    weights: "0 / 10",
    flightStart: "0",
    flightEnd: "0",
    dwellEnd: "0.3030",
    rail: "0",
  },
  {
    id: "mecca",
    station: <Code>mecca</Code>,
    weights: "3 / 5",
    flightStart: "0.3030",
    flightEnd: "0.3939",
    dwellEnd: "0.5455",
    rail: "0.3802",
  },
  {
    id: "samarkand",
    station: <Code>samarkand</Code>,
    weights: "5 / 10",
    flightStart: "0.5455",
    flightEnd: "0.6970",
    dwellEnd: "1",
    rail: "1",
  },
];

const getRangeTable = (labels: Unit05Content["timeline"]["columns"]) => {
  const columns: Column<RangeRow>[] = [
    { key: "station", label: labels.station },
    { key: "weights", label: "flight / dwell", numeric: true },
    { key: "flightStart", label: "flightStart", numeric: true },
    { key: "flightEnd", label: "flightEnd", numeric: true },
    { key: "dwellEnd", label: "dwellEnd", numeric: true },
    { key: "rail", label: labels.rail, numeric: true },
  ];

  return { columns, rows: RANGE_ROWS };
};

/** Function and file per row; each locale supplies the prose columns. */
const QUERY_FUNCTIONS = [
  { id: "ranges", fn: "buildStationRanges", file: "timeline/stations.ts" },
  { id: "index", fn: "getStationIndex", file: "timeline/stations.ts" },
  { id: "skip", fn: "getSkipDestination", file: "timeline/stations.ts" },
  { id: "count", fn: "countDestinationsBetween", file: "timeline/stations.ts" },
  {
    id: "rail-positions",
    fn: "getStationRailPositions",
    file: "camera/pacing.ts",
  },
  { id: "rail-progress", fn: "getRailProgress", file: "camera/pacing.ts" },
] as const;

type QueryId = (typeof QUERY_FUNCTIONS)[number]["id"];

type QueryRow = {
  id: string;
  fn: ReactNode;
  file: ReactNode;
  answer: string;
  when: string;
};

const getQueryTable = (labels: Unit05Content["queries"]) => {
  const columns: Column<QueryRow>[] = [
    { key: "fn", label: labels.columns.fn },
    { key: "file", label: labels.columns.file },
    { key: "answer", label: labels.columns.answer },
    { key: "when", label: labels.columns.when },
  ];

  const rows: QueryRow[] = QUERY_FUNCTIONS.map(({ id, fn, file }) => ({
    id,
    fn: <Code>{fn}</Code>,
    file: <Code>{file}</Code>,
    ...labels.rows[id],
  }));

  return { columns, rows };
};

export type { QueryId };
export { getQueryTable, getRangeTable };
