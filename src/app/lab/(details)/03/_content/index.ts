import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit03Content } from "./types";

const CONTENT: Localised<Unit03Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/** Unit 03's notes in the current locale. */
const useUnit03Content = () => CONTENT[useLabLocale()];

export { useUnit03Content };
