"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  // Control de visibilidad
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Contenido del header
  title: React.ReactNode;
  description?: React.ReactNode;

  // Tamaño (solo afecta Dialog en desktop)
  size?: "sm" | "md" | "lg" | "xl" | "full";

  // Altura del Sheet en mobile (opcional)
  mobileHeight?: string;

  // Contenido
  children: React.ReactNode;

  // Clases adicionales
  className?: string;
  contentClassName?: string;
}

/**
 * ResponsiveDialog - Componente genérico que adapta automáticamente entre Dialog y Sheet
 *
 * En mobile: Renderiza un Sheet (bottom drawer) con ScrollArea
 * En desktop: Renderiza un Dialog tradicional con tamaño configurable
 *
 * @example
 * ```tsx
 * <ResponsiveDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Detalle de Venta #0016"
 *   description="14 de diciembre de 2025"
 *   size="lg"
 * >
 *   <div>Tu contenido aquí...</div>
 * </ResponsiveDialog>
 * ```
 *
 * Para migrar un Dialog existente:
 * 1. Cambiar import: import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
 * 2. Reemplazar Dialog por ResponsiveDialog con props: open, onOpenChange, title, description, size
 * 3. Eliminar DialogContent, DialogHeader, DialogTitle, DialogDescription del JSX
 * 4. Los children van directamente dentro de ResponsiveDialog
 * 5. Eliminar useIsMobile si se estaba usando
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  size = "lg",
  mobileHeight = "90vh",
  children,
  className,
  contentClassName,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  // Mapa de tamaños para Dialog en desktop
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-[95vw]",
  };

  // Renderizar Sheet en mobile
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={cn("h-[90vh] flex flex-col p-0", className)}
        >
          {/* Header fijo */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          </div>
          
          {/* Contenido scrollable con ScrollArea */}
          <ScrollArea className="flex-1 px-6">
            <div className="pb-6">
              {children}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Renderizar Dialog en desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] overflow-y-auto",
          contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
