"use client";

import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { BusinessLineCard } from "./business-line-card";
import { getBusinessLineColumns } from "./business-line-columns";
import type { BusinessLineWithRelations } from "@/lib/types/business-line";

interface BusinessLineTableProps {
  businessLines: BusinessLineWithRelations[];
  onEdit: (businessLine: BusinessLineWithRelations) => void;
  onDelete: (businessLine: BusinessLineWithRelations) => void;
  t: (key: string) => string;
  enablePagination?: boolean;
}

export function BusinessLineTable({
  businessLines,
  onEdit,
  onDelete,
  t,
  enablePagination = true,
}: BusinessLineTableProps) {
  const columns = getBusinessLineColumns({ onEdit, onDelete, t });

  return (
    <ResponsiveDataView
      columns={columns}
      renderCard={(businessLine) => (
        <BusinessLineCard
          businessLine={businessLine}
          onEdit={() => onEdit(businessLine)}
          onDelete={() => onDelete(businessLine)}
        />
      )}
      data={businessLines}
      showPagination
      enablePagination={enablePagination}
      pageSize={10}
      emptyMessage={t("noBusinessLines")}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
