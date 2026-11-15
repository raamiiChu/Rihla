import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components";

export default async function Home() {
  const t = await getTranslations("home");
  return (
    <main className="flex h-dvh flex-col items-center justify-center">
      <LocaleSwitcher />
      <h1>{t("title")}</h1>
      <p>
        {t.rich("intro", {
          i: (chunks) => <i lang="en">{chunks}</i>,
        })}
      </p>
    </main>
  );
}
