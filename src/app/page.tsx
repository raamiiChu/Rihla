import { getTranslations } from "next-intl/server";
import { LocaleSwitcher, SmoothScroll } from "@/components";
import { JumpMask, SceneLoader, StationStops } from "./_components";
import { JumpMaskProvider } from "./_contexts/JumpMaskProvider";

/**
 * The journey's scroll length, in screen heights. A first guess, to be tuned
 * with the timeline's weights once the scenes exist.
 */
const SCROLL_LENGTH_SCREENS = 30;

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <>
      <header className="fixed inset-e-4 top-4 z-20">
        <LocaleSwitcher />
      </header>

      <main style={{ height: `${SCROLL_LENGTH_SCREENS * 100}dvh` }}>
        <h1 className="sr-only">{t("title")}</h1>

        <JumpMaskProvider>
          <SceneLoader />
          <StationStops />
          <JumpMask />
        </JumpMaskProvider>
      </main>

      <SmoothScroll />
    </>
  );
}
