"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/lib/locale";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/locale-config";
import { useLocale } from "next-intl";

export function LanguageSelector() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-2 bg-primary/10 hover:bg-primary/5 rounded-full cursor-pointer"
          disabled={isPending}
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>{LOCALE_NAMES[locale]}</span>
            {currentLocale === locale && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
