"use server";

import { auth } from "@/auth/auth";
import {
  generatePresignedUploadUrl,
  generatePresignedReadUrl,
  extractS3KeyFromUrl,
} from "@/lib/s3";
import { headers } from "next/headers";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PresignedUrlInput {
  fileName: string;
  contentType: string;
  fileSize?: number;
  folder?: string;
}

interface PresignedUrlResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    key: string;
    url: string;
  };
  error?: string;
}

const requireAuth = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
};

export const generateUploadPresignedUrl = async (
  input: PresignedUrlInput,
): Promise<PresignedUrlResponse> => {
  try {
    await requireAuth();

    const { fileName, contentType, fileSize, folder = "payments" } = input;

    if (!fileName || !contentType) {
      return {
        success: false,
        error: "Faltan parámetros requeridos",
      };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return {
        success: false,
        error:
          "Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG o WEBP.",
      };
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "El archivo es demasiado grande. Máximo 10MB.",
      };
    }

    // Generar presigned URL
    const result = await generatePresignedUploadUrl(
      fileName,
      contentType,
      folder,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar URL de subida",
    };
  }
};

/**
 * Genera un presigned URL de lectura para visualizar un archivo en S3
 * @param url - URL del archivo almacenada en la DB
 * @returns Promise con la URL firmada temporal
 */
export const getPresignedReadUrl = async (
  url: string,
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    await requireAuth();

    // Extraer el key desde la URL
    const key = extractS3KeyFromUrl(url);
    if (!key) {
      return {
        success: false,
        error: "URL inválida",
      };
    }

    // Generar URL de lectura firmada (válida por 10 minutos)
    const signedUrl = await generatePresignedReadUrl(key, 600);

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error("Error generating read URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar URL de lectura",
    };
  }
};
