"use client";

import { useEffect, useState } from "react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { X, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export const InstallPrompt = () => {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
  const t = useTranslations("pwa");
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show success message when app is installed
    if (isInstalled && !showSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, showSuccess]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowSuccess(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if dismissed, already installed, or can't install
  if (isDismissed || isInstalled || !canInstall) {
    return null;
  }

  // Show success message
  if (showSuccess) {
    return (
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg bg-green-500 text-white max-w-md">
          <Download className="h-5 w-5" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {t("installedSuccess")}
            </span>
            <span className="text-xs opacity-90">
              {t("installedDescription")}
            </span>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 hover:bg-green-600 rounded p-1"
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Show install prompt
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="flex items-center gap-4 px-6 py-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md">
        <Download
          className="h-6 w-6 text-primary flex-shrink-0"
          aria-hidden="true"
        />
        <div className="flex flex-col flex-1">
          <span
            id="install-prompt-title"
            className="font-semibold text-sm text-gray-900 dark:text-gray-100"
          >
            {t("installPrompt")}
          </span>
          <span
            id="install-prompt-description"
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            {t("installDescription")}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="whitespace-nowrap"
          >
            {t("installButton")}
          </Button>
          <button
            onClick={handleDismiss}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2"
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
