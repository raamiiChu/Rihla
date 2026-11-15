"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

export const setLocale = async (value: string): Promise<void> => {
  if (!isLocale(value)) {
    throw new Error(`Invalid locale: ${value}`);
  }

  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
};
