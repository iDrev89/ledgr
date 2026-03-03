"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Vault, Lock, AlertCircle } from "lucide-react";
import { useActiveCashSession, useCashSessions } from "@/hooks/use-cash-session";
import { CashSessionStatusBanner } from "@/components/cash-register/cash-session-status-banner";
import { CashSessionSummary } from "@/components/cash-register/cash-session-summary";
import { CashSessionTable } from "@/components/cash-register/cash-session-table";
import { CashOpenDialog } from "@/components/cash-register/cash-open-dialog";
import { CashCloseDialog } from "@/components/cash-register/cash-close-dialog";

export default function CashRegisterPage() {
  const t = useTranslations("CashRegister");
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const {
    data: activeSession,
    isLoading: isLoadingActive,
    error: activeError,
  } = useActiveCashSession();

  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useCashSessions();

  const hasActiveSession = !!activeSession;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {!isLoadingActive && (
          <div className="flex gap-2">
            {hasActiveSession ? (
              <Button
                onClick={() => setCloseDialogOpen(true)}
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                {t("closeCash")}
              </Button>
            ) : (
              <Button
                onClick={() => setOpenDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Vault className="mr-2 h-4 w-4" />
                {t("openCash")}
              </Button>
            )}
          </div>
        )}
      </div>

      <CashSessionStatusBanner
        session={activeSession}
        isLoading={isLoadingActive}
      />

      {activeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {activeError instanceof Error
              ? activeError.message
              : t("loadError")}
          </AlertDescription>
        </Alert>
      )}

      {hasActiveSession && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("turnSummary")}
          </h2>
          <CashSessionSummary sessionId={activeSession.id} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("sessions")}</CardTitle>
          <CardDescription>{t("sessionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {sessionsError instanceof Error
                  ? sessionsError.message
                  : t("loadError")}
              </AlertDescription>
            </Alert>
          )}

          {isLoadingSessions ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <CashSessionTable sessions={sessionsData?.sessions ?? []} />
          )}
        </CardContent>
      </Card>

      <CashOpenDialog open={openDialogOpen} onOpenChange={setOpenDialogOpen} />

      {activeSession && (
        <CashCloseDialog
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
          session={activeSession}
        />
      )}
    </div>
  );
}
