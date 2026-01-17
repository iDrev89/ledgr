"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

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

  // Server-side search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isSearching?: boolean;

  // Paginación
  pageSize?: number;
  showPagination?: boolean;

  // Estados
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

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
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  isSearching = false,
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
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
  const paginatedData = showPagination
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

  // Check if search is enabled
  const hasSearch = onSearchChange !== undefined;

  // Renderizar versión desktop (DataTable)
  if (!isMobile) {
    return (
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        isSearching={isSearching}
        showPagination={showPagination}
        pageSize={pageSize}
      />
    );
  }

  // Renderizar versión mobile (Cards)
  return (
    <div className="w-full space-y-4">
      {/* Búsqueda Mobile */}
      {hasSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8"
          />
          {isSearching && (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

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
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>

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
      )}

      {/* Info total de resultados */}
      {searchValue && (
        <div className="text-xs text-center text-muted-foreground">
          {data.length} resultado{data.length !== 1 ? "s" : ""} encontrado
          {data.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
