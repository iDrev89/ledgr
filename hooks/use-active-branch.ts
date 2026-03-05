import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/auth/auth-client";
import { useUserBranches } from "./use-branches";
import type { Branch } from "@/lib/types/branch";

const ACTIVE_BRANCH_KEY = "ledgr-active-branch-id";

export const useActiveBranch = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: userBranches, isLoading } = useUserBranches(userId ?? "");

  const [activeBranchId, setActiveBranchIdState] = useState<string | undefined>(
    undefined,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const activeBranches = useMemo(() => {
    if (!userBranches) return [];
    return userBranches
      .filter((ub) => ub.branch?.active)
      .map((ub) => ub.branch as Branch);
  }, [userBranches]);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_BRANCH_KEY);
    if (stored) {
      setActiveBranchIdState(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || activeBranches.length === 0) return;

    if (activeBranchId && activeBranches.find((b) => b.id === activeBranchId)) {
      return;
    }

    if (activeBranches.length === 1) {
      setActiveBranchIdState(activeBranches[0].id);
      localStorage.setItem(ACTIVE_BRANCH_KEY, activeBranches[0].id);
      return;
    }

    const defaultBranch = activeBranches.find((b) => b.isDefault);
    if (defaultBranch) {
      setActiveBranchIdState(defaultBranch.id);
      localStorage.setItem(ACTIVE_BRANCH_KEY, defaultBranch.id);
      return;
    }

    if (activeBranches.length > 0) {
      setActiveBranchIdState(activeBranches[0].id);
      localStorage.setItem(ACTIVE_BRANCH_KEY, activeBranches[0].id);
      return;
    }

    if (activeBranchId) {
      setActiveBranchIdState(undefined);
      localStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  }, [isHydrated, activeBranches, activeBranchId]);

  const setActiveBranchId = useCallback((id: string | undefined) => {
    setActiveBranchIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_BRANCH_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  }, []);

  const activeBranch = useMemo(() => {
    if (!activeBranchId) return undefined;
    return activeBranches.find((b) => b.id === activeBranchId);
  }, [activeBranchId, activeBranches]);

  return {
    activeBranchId,
    setActiveBranchId,
    activeBranch,
    userBranches: activeBranches,
    isLoading,
  };
};
