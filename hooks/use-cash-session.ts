import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveCashSession,
  getCashSessions,
  getCashSessionById,
  getLastClosedSession,
  getSessionTurnSummary,
  getExpectedBalance,
  openCashSession,
  closeCashSession,
  deleteCashSession,
} from "@/apis/actions/cash-session";
import type { OpenSessionInput, CloseSessionInput } from "@/lib/validations/cash-session";

export const useActiveCashSession = (accountId?: string) =>
  useQuery({
    queryKey: ["cash-sessions", "active", accountId],
    queryFn: async () => {
      const result = await getActiveCashSession(accountId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

export const useCashSessions = (params?: {
  accountId?: string;
  branchId?: string;
  status?: "OPEN" | "CLOSED";
  dateFrom?: string;
  dateTo?: string;
}) =>
  useQuery({
    queryKey: ["cash-sessions", params],
    queryFn: async () => {
      const result = await getCashSessions(params);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

export const useCashSession = (id: string) =>
  useQuery({
    queryKey: ["cash-sessions", id],
    queryFn: async () => {
      const result = await getCashSessionById(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });

export const useLastClosedSession = (accountId: string) =>
  useQuery({
    queryKey: ["cash-sessions", "last-closed", accountId],
    queryFn: async () => {
      const result = await getLastClosedSession(accountId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!accountId,
  });

export const useSessionTurnSummary = (sessionId: string) =>
  useQuery({
    queryKey: ["cash-sessions", "turn-summary", sessionId],
    queryFn: async () => {
      const result = await getSessionTurnSummary(sessionId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!sessionId,
    refetchInterval: 30000,
  });

export const useExpectedBalance = (accountId: string) =>
  useQuery({
    queryKey: ["cash-sessions", "expected-balance", accountId],
    queryFn: async () => {
      const result = await getExpectedBalance(accountId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!accountId,
  });

export const useOpenCashSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OpenSessionInput) => {
      const result = await openCashSession(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
    },
  });
};

export const useCloseCashSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CloseSessionInput) => {
      const result = await closeCashSession(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteCashSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCashSession(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
    },
  });
};
