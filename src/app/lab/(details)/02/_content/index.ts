import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit02Content } from "./types";

const CONTENT: Localised<Unit02Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/** Unit 02's notes in the current locale. */
const useUnit02Content = () => CONTENT[useLabLocale()];

export { getReadTable, getRenderTable } from "./tables";
export { useUnit02Content };
