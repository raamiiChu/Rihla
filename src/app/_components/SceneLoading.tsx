"use client";

import { useTranslations } from "next-intl";

/**
 * Shown while the Scene chunk loads. A stand-in until the loading animation,
 * which will also hide the shader warm-up.
 */
const SceneLoading = () => {
  const t = useTranslations("home");

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {t("loading")}
    </div>
  );
};

export default SceneLoading;
