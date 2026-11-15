"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { type Locale, locales } from "@/i18n/config";

const LABELS: Record<Locale, string> = {
  "en-GB": "English",
  "zh-TW": "繁體中文",
};

const LocaleSwitcher = () => {
  const current = useLocale();
  const t = useTranslations("localeSwitcher");
  const [isPending, startTransition] = useTransition();

  return (
    <fieldset aria-label={t("label")}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === current}
          disabled={isPending}
          onClick={() => startTransition(() => setLocale(locale))}
        >
          {LABELS[locale]}
        </button>
      ))}
    </fieldset>
  );
};

export default LocaleSwitcher;
