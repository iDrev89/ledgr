"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CardActions {
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onCloseSale?: (item: any) => void;
  isDraftCard?: boolean;
  isAdmin?: boolean;
  locale?: string;
}

interface ResponsiveDataViewProps<TData> {
  // Configuración de tabla (desktop)
  columns: ColumnDef<TData>[];

  // Configuración de cards (mobile)
  renderCard: (item: TData, actions: CardActions) => React.ReactNode;
  cardGridCols?: string;

  // Datos
  data: TData[];

  // Total count for "Mostrando X de Y" display
  totalCount?: number;

  // Paginación
  pageSize?: number;
  showPagination?: boolean;
  /** Current page for server-side pagination (0-indexed) */
  page?: number;
  /** Callback when page changes for server-side pagination */
  onPageChange?: (page: number) => void;

  /** Enabe internal pagination rendering. Set to false if pagination is handled externally. */
  enablePagination?: boolean;

  // Estados
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Deprecated - search is now handled at page level
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;

  // Callbacks para mobile
  onView?: (item: TData) => void;
  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  onCloseSale?: (item: TData) => void;
  isDraftCard?: boolean;
  isAdmin?: boolean;

  // Otros
  locale?: string;
}

export function ResponsiveDataView<TData>({
  columns,
  renderCard,
  cardGridCols = "grid-cols-1 sm:grid-cols-2",
  data,
  totalCount,
  pageSize = 10,
  showPagination = true,
  page,
  onPageChange,
  enablePagination = true,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  searchValue,
  onView,
  onEdit,
  onDelete,
  onCloseSale,
  isDraftCard,
  isAdmin,
  locale,
}: ResponsiveDataViewProps<TData>) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = React.useState(0);

  // Calcular paginación para mobile
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  // If external pagination is enabled, we display data as is (it's already sliced by server)
  // If internal pagination is enabled, we slice the data
  const paginatedData =
    showPagination && enablePagination
      ? data.slice(startIndex, endIndex)
      : data;

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchValue]);

  // Card actions para pasar a renderCard
  const cardActions: CardActions = {
    onView,
    onEdit,
    onDelete,
    onCloseSale,
    isDraftCard,
    isAdmin,
    locale,
  };

  // Renderizar versión desktop (DataTable)
  if (!isMobile) {
    return (
      <DataTable
        columns={columns}
        data={data}
        totalCount={totalCount ?? data.length}
        showPagination={showPagination}
        pageSize={pageSize}
        page={page}
        onPageChange={onPageChange}
        emptyMessage={emptyMessage}
        enablePagination={enablePagination}
      />
    );
  }

  // Renderizar versión mobile (Cards)
  return (
    <div className="w-full space-y-4">
      {/* Cards Grid */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {emptyIcon}
          <p className="text-sm text-muted-foreground mt-2">{emptyMessage}</p>
        </div>
      ) : (
        <div className={`grid ${cardGridCols} gap-3`}>
          {paginatedData.map((item, index) => (
            <div key={index}>{renderCard(item, cardActions)}</div>
          ))}
        </div>
      )}

      {/* Paginación Mobile */}
      {showPagination && enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} de {totalCount ?? data.length} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
