import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit06Content } from "./types";

const CONTENT: Localised<Unit06Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/**
 * Unit 06's notes in the current locale. Server Components only: client
 * components get their strings through props, so the notes stay out of the
 * browser bundle.
 */
const useUnit06Content = () => CONTENT[useLabLocale()];

export { useUnit06Content };
