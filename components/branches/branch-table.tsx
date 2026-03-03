"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { BranchCard } from "./branch-card";
import { getBranchColumns } from "./branch-columns";
import type { BranchWithRelations } from "@/lib/types/branch";

interface BranchTableProps {
  branches: BranchWithRelations[];
  onEdit: (branch: BranchWithRelations) => void;
  onDelete: (branch: BranchWithRelations) => void;
  t: (key: string) => string;
  enablePagination?: boolean;
}

export function BranchTable({
  branches,
  onEdit,
  onDelete,
  t,
  enablePagination = true,
}: BranchTableProps) {
  const columns = getBranchColumns({ onEdit, onDelete, t });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(branch) => (
        <BranchCard
          branch={branch}
          onEdit={() => onEdit(branch)}
          onDelete={() => onDelete(branch)}
        />
      )}
      data={branches}
      showPagination
      enablePagination={enablePagination}
      pageSize={10}
      emptyMessage={t("noBranches")}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
