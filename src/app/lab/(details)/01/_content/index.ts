import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit01Content } from "./types";

const CONTENT: Localised<Unit01Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/** Unit 01's notes in the current locale. */
const useUnit01Content = () => CONTENT[useLabLocale()];

export { getGlyphTable, getMetricTable } from "./tables";
export { useUnit01Content };
