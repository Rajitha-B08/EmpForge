import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./public/uploads";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class FileValidationError extends Error {}

/**
 * Saves an uploaded file to local disk and returns its public URL.
 * Swap this implementation out for an S3/Blob client later - the
 * calling code only depends on `saveFile` returning a URL string.
 */
export async function saveFile(file: File, subfolder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new FileValidationError(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new FileValidationError("File is too large (max 5MB)");
  }

  const dir = path.join(UPLOADS_DIR, subfolder);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  return `/uploads/${subfolder}/${filename}`;
}
