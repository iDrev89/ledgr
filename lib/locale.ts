"use server";

import { cookies } from "next/headers";
import { LOCALES, type Locale } from "./locale-config";

/**
 * Server actions for locale management
 * Only async functions can be exported from "use server" files
 */

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale;
  return locale && LOCALES.includes(locale) ? locale : "en";
}

export async function setLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

