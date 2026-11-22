import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit00Content } from "./types";

const CONTENT: Localised<Unit00Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/** Unit 00's notes in the current locale. */
const useUnit00Content = () => CONTENT[useLabLocale()];

export { useUnit00Content };
