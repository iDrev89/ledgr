/**
 * Locale configuration constants and types
 * This file contains non-server code that can be imported by both client and server components
 */

export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};
