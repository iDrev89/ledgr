import { useState, useEffect, useCallback, useMemo } from "react";
import { useBranches } from "./use-branches";

const ACTIVE_BRANCH_KEY = "ledgr-active-branch-id";

export const useActiveBranch = () => {
  const [activeBranchId, setActiveBranchIdState] = useState<string | undefined>(
    undefined,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: branchesData } = useBranches({ activeOnly: true });

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_BRANCH_KEY);
    if (stored) {
      setActiveBranchIdState(stored);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !branchesData?.branches) return;

    const branches = branchesData.branches;

    if (branches.length === 1 && !activeBranchId) {
      setActiveBranchIdState(branches[0].id);
      localStorage.setItem(ACTIVE_BRANCH_KEY, branches[0].id);
      return;
    }

    if (
      activeBranchId &&
      !branches.find((b) => b.id === activeBranchId)
    ) {
      setActiveBranchIdState(undefined);
      localStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  }, [isHydrated, branchesData, activeBranchId]);

  const setActiveBranchId = useCallback((id: string | undefined) => {
    setActiveBranchIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_BRANCH_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  }, []);

  const activeBranch = useMemo(() => {
    if (!activeBranchId || !branchesData?.branches) return undefined;
    return branchesData.branches.find((b) => b.id === activeBranchId);
  }, [activeBranchId, branchesData]);

  return {
    activeBranchId,
    setActiveBranchId,
    activeBranch,
  };
};
