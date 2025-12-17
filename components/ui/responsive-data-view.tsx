"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CardActions {
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
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
  
  // Búsqueda y filtrado
  searchKey?: string | string[];
  searchPlaceholder?: string;
  
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
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No data available",
  emptyIcon,
  onView,
  onEdit,
  onDelete,
  locale,
}: ResponsiveDataViewProps<TData>) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(0);

  // Filtrar datos según búsqueda
  const filteredData = React.useMemo(() => {
    if (!searchValue || !searchKey) return data;

    const searchLower = searchValue.toLowerCase();
    const keys = Array.isArray(searchKey) ? searchKey : [searchKey];

    return data.filter((item: any) => {
      return keys.some((key) => {
        try {
          // Manejar keys anidadas como "customer.name"
          const value = key.split('.').reduce((obj, k) => obj?.[k], item);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        } catch {
          return false;
        }
      });
    });
  }, [data, searchValue, searchKey]);

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
    locale,
  };

  // Renderizar versión desktop (DataTable)
  if (!isMobile) {
    return (
      <DataTable
        columns={columns}
        data={data}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        showPagination={showPagination}
        pageSize={pageSize}
      />
    );
  }

  // Renderizar versión mobile (Cards)
  return (
    <div className="w-full space-y-4">
      {/* Búsqueda */}
      {searchKey && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
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
            <div key={index}>
              {renderCard(item, cardActions)}
            </div>
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
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
          {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}


