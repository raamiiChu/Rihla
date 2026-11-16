import type { Metadata } from "next";
import { Amiri, Noto_Serif_TC, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

import { getDirection } from "@/i18n/config";
import { cn } from "@/lib/utils";

// en
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-latin",
});

// zh
const notoSerifTC = Noto_Serif_TC({
  weight: ["400", "600"],
  preload: false,
  display: "swap",
  variable: "--font-tc",
});

// ar
const amiri = Amiri({
  weight: ["400"],
  subsets: ["arabic"],
  preload: false,
  display: "swap",
  variable: "--font-arabic",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("title"), description: t("description") };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      // The site is always dark: `dark` activates the `dark:` variants that
      // shadcn/ui components rely on.
      className={cn(
        "dark h-full antialiased",
        sourceSerif.variable,
        notoSerifTC.variable,
        amiri.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
