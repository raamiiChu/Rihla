import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit04Content } from "./types";

const CONTENT: Localised<Unit04Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/** Unit 04's notes in the current locale. */
const useUnit04Content = () => CONTENT[useLabLocale()];

export {
  getGateTable,
  getLayoutTable,
  getLevellingTable,
  getLineTable,
  getRotationTable,
  getSegmentTable,
} from "./tables";
export { useUnit04Content };
