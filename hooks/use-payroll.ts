import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import {
  getPayrollRuns,
  getPayrollRun,
  createPayrollRun,
  finalizePayrollRun,
  payPayrollRun,
  deletePayrollRun,
  getPayrollEntries,
  createPayrollEntry,
  deletePayrollEntry,
} from "@/apis/actions/payroll";
import type {
  CreatePayrollRunInput,
  CreatePayrollEntryInput,
} from "@/lib/validations/payroll";
import type {
  PayrollRunWithDetails,
  PayrollEntryWithDetails,
} from "@/lib/types/payroll";
import type {
  PayrollRunStatus,
  PayrollEntryKind,
} from "@/prisma/prisma-client";

// ==================== PAYROLL RUNS ====================

export const usePayrollRuns = (params?: {
  status?: PayrollRunStatus;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ["payroll-runs", params],
    queryFn: async () => {
      const result = await getPayrollRuns(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const usePayrollRun = (id: string | null) => {
  return useQuery({
    queryKey: ["payroll-run", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const result = await getPayrollRun(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");
  const tErrors = useTranslations("Payroll.errors");

  return useMutation({
    mutationFn: async (
      input: CreatePayrollRunInput & { userIds?: string[] }
    ) => {
      const result = await createPayrollRun(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({
        title: t("createSuccess"),
        description: t("createSuccessDescription"),
      });
    },
  });
};

export const useFinalizePayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await finalizePayrollRun(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-run", data.id] });
      toast({
        title: t("finalizeSuccess"),
        description: t("finalizeSuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("finalizeError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePayPayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");

  return useMutation({
    mutationFn: async ({
      id,
      payments,
    }: {
      id: string;
      payments: { userId: string; amount: string }[];
    }) => {
      const result = await payPayrollRun(id, payments);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-run", data.id] });
      toast({
        title: t("paySuccess"),
        description: t("paySuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("payError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePayrollRun = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePayrollRun(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({
        title: t("deleteSuccess"),
        description: t("deleteSuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// ==================== PAYROLL ENTRIES ====================

export const usePayrollEntries = (params?: {
  userId?: string;
  kind?: PayrollEntryKind;
  period?: string;
  runId?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ["payroll-entries", params],
    queryFn: async () => {
      const result = await getPayrollEntries(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useCreatePayrollEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");

  return useMutation({
    mutationFn: async (input: CreatePayrollEntryInput) => {
      const result = await createPayrollEntry(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({
        title: t("entryCreateSuccess"),
        description: t("entryCreateSuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("entryCreateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePayrollEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Payroll.messages");

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePayrollEntry(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({
        title: t("entryDeleteSuccess"),
        description: t("entryDeleteSuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("entryDeleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
