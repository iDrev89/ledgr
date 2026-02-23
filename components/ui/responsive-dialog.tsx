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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

  // Renderizar Drawer en mobile (vaul — soporta swipe-to-dismiss)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent
          className={cn("flex flex-col max-h-[90vh] p-0", className)}
        >
          {/* Header fijo */}
          <div className="flex-shrink-0 px-6 pt-2 pb-4">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          </div>

          {/* Contenido scrollable — div nativo para compatibilidad con vaul */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
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
