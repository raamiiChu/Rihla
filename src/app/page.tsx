import { getTranslations } from "next-intl/server";
import { LocaleSwitcher, SmoothScroll } from "@/components";
import { SceneLoader, StationLines, Stations } from "./_components";
import { JumpMaskProvider } from "./_contexts/JumpMaskProvider";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <>
      <header className="fixed inset-e-4 top-4 z-20">
        <LocaleSwitcher />
      </header>

      <main>
        <h1 className="sr-only">{t("title")}</h1>

        <JumpMaskProvider>
          <SceneLoader />
          <StationLines />
        </JumpMaskProvider>

        <Stations />
      </main>

      <SmoothScroll />
    </>
  );
}
