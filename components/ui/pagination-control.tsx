"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number; // 0-indexed
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationControl({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  disabled = false,
}: PaginationControlProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  if (totalCount <= pageSize) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      {/* Desktop: Show record count on left */}
      <div className="hidden sm:block text-sm text-muted-foreground">
        Mostrando {totalCount > 0 ? startItem : 0} -{" "}
        {totalCount > 0 ? endItem : 0} de {totalCount} registros
      </div>

      {/* Mobile: Anterior button on left */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 0}
        className="sm:hidden text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>

      {/* Mobile: Page indicator in center */}
      <span className="sm:hidden text-sm text-muted-foreground">
        Página {currentPage + 1} de {totalPages}
      </span>

      {/* Desktop: Buttons on right */}
      <div className="hidden sm:flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages - 1}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Mobile: Siguiente button on right */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages - 1}
        className="sm:hidden text-muted-foreground hover:text-foreground"
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
