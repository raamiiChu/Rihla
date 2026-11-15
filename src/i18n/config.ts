export const locales = ["en-GB", "zh-TW"] as const;
export type Locale = (typeof locales)[number];
type Direction = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en-GB";
export const LOCALE_COOKIE = "locale";

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale);
};

export const getDirection = (_locale: Locale): Direction => {
  // return locale === "ar" ? "rtl" : "ltr";
  return "ltr";
};
