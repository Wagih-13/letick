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
  
  // Store uploads inside the project under /public/uploads
  const uploadsBasePath = path.join(process.cwd(), "public", "uploads");
  
  // Products: /public/uploads/products/<year>/<month>
  if (folder === "products") {
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const baseDir = path.join(uploadsBasePath, folder, year, month);
    const publicBase = path.posix.join("/uploads", folder, year, month);
    return { baseDir, publicBase };
  }
  
  // Other folders: /public/uploads/<folder>
  const baseDir = path.join(uploadsBasePath, folder);
  const publicBase = path.posix.join("/uploads", folder);
  return { baseDir, publicBase };
}

function getResizeConfig(folder: string) {
  if (folder === "products") return { width: 1600, height: 1600, quality: 70 };
  if (folder === "categories") return { width: 1200, height: 800, quality: 68 };
  if (folder === "avatars") return { width: 512, height: 512, quality: 70 };
  return { width: 1400, height: 1400, quality: 70 };
}

export async function processImageUpload(file: File, folder: string, quality: number = 68): Promise<ProcessedImage> {
  const { baseDir, publicBase } = getDestDir(folder);
  await fs.mkdir(baseDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Convert any supported input to WebP with target quality
  // Use animated: true to preserve simple animations when supported
  const cfg = getResizeConfig(folder);
  const q = Math.max(1, Math.min(100, Number.isFinite(quality as any) ? quality : cfg.quality));
  const webpBuffer = await sharp(inputBuffer, { animated: true })
    .rotate()
    .resize({ width: cfg.width, height: cfg.height, fit: "inside", withoutEnlargement: true })
    .webp({ quality: q, effort: 6, smartSubsample: true })
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