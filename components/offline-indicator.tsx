"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const t = useTranslations("pwa");
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowOnlineMessage(false);
    } else if (wasOffline && isOnline) {
      // User just came back online
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
        setWasOffline(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showOnlineMessage) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isOnline ? "animate-in slide-in-from-top" : ""
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          isOnline
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-gray-900"
        }`}
      >
        {isOnline ? (
          <Wifi className="h-5 w-5" aria-hidden="true" />
        ) : (
          <WifiOff className="h-5 w-5" aria-hidden="true" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {isOnline ? t("online") : t("offline")}
          </span>
          {!isOnline && (
            <span className="text-xs opacity-90">
              {t("offlineDescription")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
