import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LocaleSwitcher, SmoothScroll } from "@/components";

// Placeholder until src/data/stops.ts exists; the order follows the journey.
const STOP_IDS = [
  "tangier",
  "mecca",
  "samarkand",
  "delhi",
  "maldives",
  "quanzhou",
  "timbuktu",
  "fez",
] as const;

const italic = (chunks: ReactNode) => <i lang="en">{chunks}</i>;

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main>
      <header className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="absolute inset-e-4 top-4">
          <LocaleSwitcher />
        </div>
        <h1 className="text-5xl">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t.rich("intro", { i: italic })}
        </p>
        <p className="mt-12 text-sm text-muted-foreground">{t("scrollHint")}</p>
      </header>

      <ol>
        {STOP_IDS.map((id) => (
          <li
            key={id}
            className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center"
          >
            <p className="text-sm tracking-widest text-gold">
              {t(`stops.${id}.year`)}
            </p>
            <h2 className="text-3xl">{t(`stops.${id}.name`)}</h2>
            <p className="max-w-prose text-muted-foreground">
              {t.rich(`stops.${id}.line`, { i: italic })}
            </p>
          </li>
        ))}
      </ol>

      <SmoothScroll />
    </main>
  );
}
