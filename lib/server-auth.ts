import prisma from "@/lib/prisma";

/**
 * Resolves the branchId for a user.
 * Priority: provided branchId > user's single branch > user's default branch > system default branch
 */
export const resolveUserBranchId = async (
  userId: string,
  providedBranchId?: string | null,
): Promise<string | null> => {
  if (providedBranchId) return providedBranchId;

  const userBranches = await prisma.userBranch.findMany({
    where: { userId },
    include: { branch: { select: { id: true, isDefault: true, active: true } } },
  });

  const activeBranches = userBranches.filter((ub) => ub.branch.active);

  if (activeBranches.length === 1) {
    return activeBranches[0].branchId;
  }

  const defaultBranch = activeBranches.find((ub) => ub.branch.isDefault);
  if (defaultBranch) {
    return defaultBranch.branchId;
  }

  if (activeBranches.length > 0) {
    return activeBranches[0].branchId;
  }

  const systemDefault = await prisma.branch.findFirst({
    where: { isDefault: true, active: true },
    select: { id: true },
  });

  return systemDefault?.id ?? null;
};
