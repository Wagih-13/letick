import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

export type ProcessedImage = {
  url: string;
  path: string;
  filename: string;
  size: number;
};

function randomString(len = 8) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

function uniqueFilename(): string {
  return `${Date.now()}_${randomString(6)}.webp`;
}

function getDestDir(folder: string) {
  const now = new Date();
  
  // المسار الخارجي - خارج المشروع
  const externalBasePath = "/home/wagih/uploads/modeswear";
  
  // Preserve existing structure: products go under /year/month
  if (folder === "products") {
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const baseDir = path.join(externalBasePath, folder, year, month);
    const publicBase = path.posix.join("/uploads", folder, year, month);
    return { baseDir, publicBase };
  }
  
  // Other folders stay flat under /uploads/<folder>
  const baseDir = path.join(externalBasePath, folder);
  const publicBase = path.posix.join("/uploads", folder);
  return { baseDir, publicBase };
}

export async function processImageUpload(file: File, folder: string, quality: number = 82): Promise<ProcessedImage> {
  const { baseDir, publicBase } = getDestDir(folder);
  await fs.mkdir(baseDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Convert any supported input to WebP with target quality
  // Use animated: true to preserve simple animations when supported
  const webpBuffer = await sharp(inputBuffer, { animated: true })
    .rotate()
    .webp({ quality: Math.max(1, Math.min(100, quality)), effort: 4 })
    .toBuffer();

  const filename = uniqueFilename();
  const destPath = path.join(baseDir, filename);
  await fs.writeFile(destPath, webpBuffer);

  const url = path.posix.join(publicBase, filename);
  
  console.log('✅ Image uploaded');
  console.log('URL:', url);
  console.log('Path:', destPath);
  
  return { url, path: destPath, filename, size: webpBuffer.byteLength };
}