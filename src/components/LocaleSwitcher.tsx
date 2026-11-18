"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLocale } from "@/i18n/actions";
import { type Locale, locales } from "@/i18n/config";

const LABELS: Record<Locale, string> = {
  "en-GB": "English",
  "zh-TW": "繁體中文",
};

const LocaleSwitcher = () => {
  const currentLocale = useLocale();
  const t = useTranslations("localeSwitcher");
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={LABELS}
      value={currentLocale}
      disabled={isPending}
      onValueChange={(value) => {
        if (!value || value === currentLocale) {
          return;
        }
        startTransition(() => setLocale(value));
      }}
    >
      <SelectTrigger aria-label={t("label")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale} lang={locale}>
            {LABELS[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocaleSwitcher;
