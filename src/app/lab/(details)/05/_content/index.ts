import { useLocale } from "next-intl";
import type { Localised } from "@/app/lab/_i18n";
import enGB from "./notes.en-GB";
import zhTW from "./notes.zh-TW";
import type { Unit05Content } from "./types";

const CONTENT: Localised<Unit05Content> = {
  "en-GB": enGB,
  "zh-TW": zhTW,
};

/**
 * Unit 05's notes in the current locale. Server Components only: client
 * components get their strings through props, so the notes stay out of the
 * browser bundle.
 */
const useUnit05Content = () => CONTENT[useLocale()];

export { getQueryTable, getRangeTable } from "./tables";
export { useUnit05Content };
