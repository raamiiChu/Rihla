import type { ReactNode } from "react";
import { Ar, type Column } from "@/app/lab/_components";
import { AMIRI_METRICS, DIHLI_GLYPHS } from "../_components/dihli";
import type { Unit01Content } from "./types";

type Labels = Unit01Content["measurements"];

type MetricRow = {
  id: string;
  font: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
};

type GlyphRow = {
  id: string;
  index: number;
  letter: ReactNode;
  codePoint: string;
  form: string;
  shapedId: number;
  nominalId: number;
  xAdvance: number;
};

/** The measured numbers are the same in every locale; only the labels change. */
const getMetricTable = (labels: Labels) => {
  const columns: Column<MetricRow>[] = [
    { key: "font", label: labels.columns.font },
    { key: "unitsPerEm", label: "unitsPerEm", numeric: true },
    { key: "ascent", label: "ascent", numeric: true },
    { key: "descent", label: "descent", numeric: true },
  ];

  const rows: MetricRow[] = [
    { id: "amiri", font: `Amiri Regular${labels.adopted}`, ...AMIRI_METRICS },
    {
      id: "noto",
      font: "Noto Naskh Arabic Regular",
      unitsPerEm: 1000,
      ascent: 1069,
      descent: -634,
    },
  ];

  return { columns, rows };
};

const getGlyphTable = (labels: Labels) => {
  const columns: Column<GlyphRow>[] = [
    { key: "index", label: "i", numeric: true },
    { key: "letter", label: labels.columns.letter },
    { key: "codePoint", label: labels.columns.codePoint },
    { key: "form", label: labels.columns.form },
    { key: "shapedId", label: "shapedId", numeric: true },
    { key: "nominalId", label: "nominalId", numeric: true },
    { key: "xAdvance", label: "xAdvance", numeric: true },
  ];

  const rows: GlyphRow[] = DIHLI_GLYPHS.map((glyph, index) => ({
    id: glyph.codePoint,
    index,
    ...glyph,
    letter: <Ar>{glyph.letter}</Ar>,
    form: labels.forms[glyph.form],
  }));

  return { columns, rows };
};

export { getGlyphTable, getMetricTable };
