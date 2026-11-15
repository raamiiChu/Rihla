import type { Metadata } from "next";
import { Amiri, Noto_Serif_TC, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import type { PropsWithChildren } from "react";

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

export const metadata: Metadata = {
  title: "Rihla — Thirty Years, One Line",
  description: "Retracing Ibn Battuta's thirty-year journey in one line.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en-GB"
      className={`${sourceSerif.variable} ${notoSerifTC.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
