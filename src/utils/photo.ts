import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export interface ResolvedPhoto {
  absolutePath: string;
  buffer: Buffer;
  mimeType: string;
}

/**
 * Resolve `basics.image` relative to the resume JSON directory (not cwd).
 * Returns null when missing / unreadable so templates can omit the photo.
 */
export async function resolvePhoto(
  imagePath: string | undefined,
  resumeJsonDir: string,
): Promise<ResolvedPhoto | null> {
  if (!imagePath?.trim()) return null;

  const absolutePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(resumeJsonDir, imagePath);

  try {
    const buffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const mimeType = MIME_BY_EXT[ext] ?? 'image/jpeg';
    return { absolutePath, buffer, mimeType };
  } catch {
    console.warn(`Warning: photo not found or unreadable: ${absolutePath}`);
    return null;
  }
}

export function toDataUrl(photo: ResolvedPhoto): string {
  return `data:${photo.mimeType};base64,${photo.buffer.toString('base64')}`;
}

export function toImageBuffer(photo: ResolvedPhoto): Buffer {
  return photo.buffer;
}
