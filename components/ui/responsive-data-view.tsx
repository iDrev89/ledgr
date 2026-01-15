"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

  // Búsqueda y filtrado (client-side)
  searchKey?: string | string[];
  searchPlaceholder?: string;

  // Búsqueda controlada (server-side)
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
  searchKey,
  searchPlaceholder = "Search...",
  // Server-side search props
  searchValue: controlledSearchValue,
  onSearchChange,
  isSearching,
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No data available",
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
  // Use controlled value if provided (server-side search), otherwise use local state
  const [localSearchValue, setLocalSearchValue] = React.useState("");
  const searchValue = controlledSearchValue ?? localSearchValue;
  const setSearchValue = onSearchChange ?? setLocalSearchValue;
  const isServerSearch = onSearchChange !== undefined;
  const [currentPage, setCurrentPage] = React.useState(0);

  // Filtrar datos según búsqueda (only for client-side search)
  // When using server-side search, data is already filtered
  const filteredData = React.useMemo(() => {
    // Skip client-side filtering if using server-side search
    if (isServerSearch) return data;
    if (!searchValue || !searchKey) return data;

    const searchLower = searchValue.toLowerCase();
    const keys = Array.isArray(searchKey) ? searchKey : [searchKey];

    return data.filter((item: any) => {
      return keys.some((key) => {
        try {
          // Manejar keys anidadas como "customer.name"
          const value = key.split(".").reduce((obj, k) => obj?.[k], item);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        } catch {
          return false;
        }
      });
    });
  }, [data, searchValue, searchKey, isServerSearch]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = showPagination
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

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
        // For server-side search, pass undefined to disable DataTable's internal filtering
        searchKey={isServerSearch ? undefined : searchKey}
        searchPlaceholder={searchPlaceholder}
        showPagination={showPagination}
        pageSize={pageSize}
        // Server-side search props
        searchValue={isServerSearch ? searchValue : undefined}
        onSearchChange={isServerSearch ? setSearchValue : undefined}
        isSearching={isSearching}
      />
    );
  }

  // Renderizar versión mobile (Cards)
  return (
    <div className="w-full space-y-4">
      {/* Búsqueda - show for either client-side (searchKey) or server-side (isServerSearch) search */}
      {(searchKey || isServerSearch) && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pr-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
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
          {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}{" "}
          encontrado{filteredData.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
