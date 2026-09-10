import { Packer, type Document } from 'docx';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Pack a docx Document and write it to disk. */
export async function renderDocx(doc: Document, outputPath: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  await writeFile(outputPath, buffer);
}
