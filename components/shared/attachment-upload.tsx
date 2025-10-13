"use client";

import { Image, X, Upload } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateUploadPresignedUrl } from "@/apis/actions/upload";

interface AttachmentUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string | null;
  label?: string;
  disabled?: boolean;
}

export function AttachmentUpload({
  onUploadComplete,
  currentUrl,
  label = "Comprobante de Pago",
  disabled = false,
}: AttachmentUploadProps) {
  const [uploadState, setUploadState] = useState<{
    file: File | null;
    preview: string | null;
    progress: number;
    uploading: boolean;
  }>({
    file: null,
    preview: currentUrl || null,
    progress: 0,
    uploading: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Máximo 1MB
      maxWidthOrHeight: 1920, // Máximo 1920px
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file; // Si falla, retornar el archivo original
    }
  };

  const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadState((prev) => ({ ...prev, progress: percentComplete }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;

    // Validar tipo de archivo
    if (!validFileTypes.includes(file.type)) {
      toast.error("Por favor sube una imagen JPG, PNG o WEBP.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    // Validar tamaño (antes de comprimir)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("La imagen es demasiado grande. Máximo 10MB.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    try {
      setUploadState({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        uploading: true,
      });

      // Comprimir imagen
      toast.info("Comprimiendo imagen...", { duration: 1000 });
      const compressedFile = await compressImage(file);

      // Obtener presigned URL
      const result = await generateUploadPresignedUrl({
        fileName: file.name,
        contentType: compressedFile.type,
        fileSize: compressedFile.size,
        folder: "payments",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error al generar URL de subida");
      }

      // Subir a S3
      await uploadToS3(compressedFile, result.data.uploadUrl);

      // Notificar éxito
      toast.success("Comprobante subido exitosamente");
      
      // Retornar la URL final
      onUploadComplete(result.data.url);

      setUploadState((prev) => ({
        ...prev,
        progress: 100,
        uploading: false,
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir el archivo",
        {
          position: "bottom-right",
          duration: 5000,
        }
      );
      resetFile();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      handleFile(event.dataTransfer.files?.[0]);
    }
  };

  const resetFile = () => {
    setUploadState({ file: null, preview: null, progress: 0, uploading: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadComplete("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const { file, preview, progress, uploading } = uploadState;

  return (
    <div className="w-full space-y-4">
      {!preview ? (
        <>
          <div
            className={`flex justify-center rounded-md border border-dashed border-input px-6 py-8 ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload
                className="mx-auto h-10 w-10 text-muted-foreground"
                aria-hidden={true}
              />
              <div className="mt-4 text-sm leading-6 text-muted-foreground">
                <label
                  htmlFor="attachment-upload"
                  className={`relative font-medium text-primary ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer hover:underline"
                  }`}
                >
                  <span>Seleccionar archivo</span>
                  <input
                    id="attachment-upload"
                    name="attachment-upload"
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={disabled}
                  />
                </label>
                <span className="mx-1">o arrastra aquí</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                PNG, JPG, WEBP hasta 10MB
              </p>
            </div>
          </div>
        </>
      ) : (
        <Card className="relative bg-muted p-4">
          {!uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground z-10"
              aria-label="Eliminar"
              onClick={resetFile}
              disabled={disabled}
            >
              <X className="h-5 w-5 shrink-0" aria-hidden={true} />
            </Button>
          )}

          <div className="space-y-4">
            {/* Preview de la imagen */}
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-background">
              <img
                src={preview}
                alt="Preview del comprobante"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info del archivo */}
            {file && (
              <div className="flex items-center space-x-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                  <Image className="h-5 w-5 text-foreground" aria-hidden={true} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            )}

            {/* Barra de progreso */}
            {uploading && (
              <div className="flex items-center space-x-3">
                <Progress value={progress} className="h-1.5" />
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
            )}

            {/* Mensaje de éxito */}
            {!uploading && progress === 100 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Comprobante subido correctamente
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

