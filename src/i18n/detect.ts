import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

type Preference = { tag: string; q: number };

const parseAcceptLanguage = (header: string | null): Preference[] => {
  if (!header) {
    return [];
  }

  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam === undefined ? 1 : Number(qParam.trim().slice(2));
      return { tag: tag.trim(), q };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);
};

const toLocale = (tag: string): Locale | undefined => {
  const language = tag.toLowerCase().split("-")[0];

  if (language === "zh") {
    return "zh-TW";
  }

  if (language === "en") {
    return "en-GB";
  }

  return undefined;
};

export const detectLocale = (
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale => {
  if (cookieValue !== undefined && isLocale(cookieValue)) {
    return cookieValue;
  }

  const preferences = parseAcceptLanguage(acceptLanguage);

  for (const { tag } of preferences) {
    const locale = toLocale(tag);
    if (locale !== undefined) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
};
