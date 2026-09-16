#!/usr/bin/env node
/**
 * Copies Drive photos ingested by the sibling worker into public/products.
 * Never writes into the ingest directory.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INGEST =
  process.env.VELTRANO_INGEST ||
  "/cursor/stores/bc-1db07960-8bb0-472e-88b5-80702cb7d755/media/products";
const MANIFEST =
  process.env.VELTRANO_MANIFEST ||
  "/cursor/stores/bc-1db07960-8bb0-472e-88b5-80702cb7d755/docs/product-image-manifest.md";
const DEST = path.join(__dirname, "..", "public", "products");
const MAP = path.join(__dirname, "..", "src", "data", "image-map.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .sort();
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  const files = listImages(from);
  for (const file of files) {
    fs.copyFileSync(path.join(from, file), path.join(to, file));
  }
  return files;
}

const map = {};
let copied = 0;
if (fs.existsSync(INGEST)) {
  const slugs = fs
    .readdirSync(INGEST, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const slug of slugs) {
    const files = copyDir(path.join(INGEST, slug), path.join(DEST, slug));
    map[slug] = files;
    copied += files.length;
  }
}
fs.writeFileSync(MAP, JSON.stringify(map, null, 2) + "\n");
console.log(
  JSON.stringify(
    {
      ingestExists: fs.existsSync(INGEST),
      manifestReady: fs.existsSync(MANIFEST),
      products: Object.keys(map).length,
      files: copied,
    },
    null,
    2
  )
);
