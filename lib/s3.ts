import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  ...(process.env.AWS_S3_ENDPOINT && {
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  url: string; // URL final para almacenar en la DB
}

/**
 * Genera un presigned URL para subir un archivo a S3
 * @param fileName - Nombre del archivo
 * @param contentType - Tipo MIME del archivo
 * @param folder - Carpeta en S3 (ej: "payments", "expenses")
 * @returns Promise con uploadUrl, key y url final
 */
export const generatePresignedUploadUrl = async (
  fileName: string,
  contentType: string,
  folder: string = "payments",
): Promise<PresignedUrlResult> => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";

  // Generar key único: folder/YYYY/MM/uniqueid_timestamp.ext
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const key = `${folder}/${year}/${month}/${randomString}_${timestamp}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // Generar URL firmada válida por 5 minutos
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // URL final del archivo (sin query params de firma)
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    url,
  };
};

/**
 * Genera un presigned URL para LEER un archivo de S3
 * @param key - Key del archivo en S3
 * @param expiresIn - Tiempo de expiración en segundos (default: 10 minutos)
 * @returns Promise con la URL firmada de lectura
 */
export const generatePresignedReadUrl = async (
  key: string,
  expiresIn: number = 600, // 10 minutos
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
};

/**
 * Elimina un archivo de S3
 * @param key - Key del archivo en S3
 */
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Extrae el key de S3 desde una URL
 * @param url - URL completa del archivo
 * @returns Key del archivo o null si no es válida
 */
export const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    // Remover el primer "/" del pathname
    return path.startsWith("/") ? path.substring(1) : path;
  } catch {
    return null;
  }
};
