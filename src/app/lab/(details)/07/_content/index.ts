import { type Localised, useLabLocale } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit07Content } from "./types";

const CONTENT: Localised<Unit07Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/**
 * Unit 07's notes in the current locale. Server Components only: client
 * components get their strings through props, so the notes stay out of the
 * browser bundle.
 */
const useUnit07Content = () => CONTENT[useLabLocale()];

export { useUnit07Content };
