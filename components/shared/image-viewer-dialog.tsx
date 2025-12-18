"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { getPresignedReadUrl } from "@/apis/actions/upload";
import { toast } from "sonner";

interface ImageViewerDialogProps {
  imageUrl: string;
  title?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function ImageViewerDialog({
  imageUrl,
  title = "Ver Imagen",
  buttonText = "Ver Comprobante",
  buttonVariant = "outline",
  buttonSize = "sm",
}: ImageViewerDialogProps) {
  const [open, setOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (open && !signedUrl) {
        setLoading(true);
        try {
          const result = await getPresignedReadUrl(imageUrl);
          if (result.success && result.url) {
            setSignedUrl(result.url);
          } else {
            toast.error(result.error || "Error al cargar la imagen");
          }
        } catch (error) {
          console.error("Error loading signed URL:", error);
          toast.error("Error al cargar la imagen");
        } finally {
          setLoading(false);
        }
      }
    };

    if (open) {
      loadSignedUrl();
    } else {
      // Resetear la URL cuando se cierra el diálogo para regenerarla la próxima vez
      setSignedUrl(null);
    }
  }, [open, imageUrl, signedUrl]);

  const handleDownload = async () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <FileText className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="pr-10">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full overflow-auto space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!signedUrl || loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : signedUrl ? (
              <img
                src={signedUrl}
                alt={title}
                className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Error al cargar la imagen
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
