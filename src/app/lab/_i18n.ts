import { useLocale } from "next-intl";
import type { UnitStatus } from "./const";

/**
 * The lab supports its own set of locales, independent of the site's: if the
 * site adds Arabic, the lab keeps these two and falls back to English.
 */
const LAB_LOCALES = ["zh-TW", "en-GB"] as const;
type LabLocale = (typeof LAB_LOCALES)[number];
const LAB_FALLBACK_LOCALE: LabLocale = "en-GB";

const isLabLocale = (value: string): value is LabLocale =>
  (LAB_LOCALES as readonly string[]).includes(value);

/**
 * The current locale, narrowed to one the lab supports. Lab code calls this
 * instead of next-intl's `useLocale()`. Works in Server and Client Components.
 */
const useLabLocale = (): LabLocale => {
  const locale = useLocale();
  return isLabLocale(locale) ? locale : LAB_FALLBACK_LOCALE;
};

/**
 * Lab copy lives here and in each unit's `_content/`, not in
 * `messages/*.json`: the root layout sends all messages to the browser, and
 * lab notes are full of code snippets whose braces clash with ICU syntax.
 */
type Localised<T> = Record<LabLocale, T>;

type LabUi = {
  backLink: string;
  backLabel: string;
  sections: {
    progress: string;
    concepts: string;
    pitfalls: string;
    verification: string;
  };
  pitfall: { symptom: string; cause: string; fix: string };
  step: { done: string; todo: string };
  loading: string;
  index: {
    title: string;
    intro: string;
    progress: (done: number, total: number) => string;
    phase: (phase: number, name: string) => string;
    status: Record<UnitStatus, string>;
    script: string;
  };
};

const LAB_UI: Localised<LabUi> = {
  "zh-TW": {
    backLink: "回到練習場",
    backLabel: "返回",
    sections: {
      progress: "進度",
      concepts: "知識點",
      pitfalls: "踩過的坑",
      verification: "驗證方式",
    },
    pitfall: { symptom: "症狀", cause: "原因", fix: "解法" },
    step: { done: "完成", todo: "未完成" },
    loading: "載入中…",
    index: {
      title: "練習場",
      intro: "每個單元先在這裡用最小範例練熟，再搬進正式專案。",
      progress: (done, total) => `已完成 ${done} / ${total}`,
      phase: (phase, name) => `第 ${phase} 階段：${name}`,
      status: { done: "完成", "in-progress": "進行中", todo: "未開始" },
      script: "腳本",
    },
  },
  "en-GB": {
    backLink: "Back to the lab",
    backLabel: "Back",
    sections: {
      progress: "Progress",
      concepts: "Concepts",
      pitfalls: "Pitfalls",
      verification: "Verification",
    },
    pitfall: { symptom: "Symptom", cause: "Cause", fix: "Fix" },
    step: { done: "Done", todo: "To do" },
    loading: "Loading…",
    index: {
      title: "Practice lab",
      intro:
        "Each unit is practised here with a minimal example before it moves into the main project.",
      progress: (done, total) => `${done} of ${total} done`,
      phase: (phase, name) => `Phase ${phase}: ${name}`,
      status: {
        done: "Done",
        "in-progress": "In progress",
        todo: "Not started",
      },
      script: "Script",
    },
  },
};

/** Works in Server Components and Client Components alike. */
const useLabUi = () => LAB_UI[useLabLocale()];

export type { LabLocale, Localised };
export { useLabLocale, useLabUi };
