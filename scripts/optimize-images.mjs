// out/ 디렉터리 내 이미지를 in-place로 최적화한다.
// - PNG/JPEG/JPG: 너비 max 1920px로 리사이즈, 품질 80 재인코딩 (포맷 유지)
// - WebP: 너비 max 1920px로 리사이즈, 품질 80
// - 원본 파일명 유지 → 컴포넌트의 next/image src 수정 불필요
// 기준 크기: 500KB 미만은 건너뛴다 (이미 충분히 작음).

import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const TARGET_DIR = "out";
const MAX_WIDTH = 1920;
const QUALITY = 80;
const SKIP_BELOW_BYTES = 500 * 1024;

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function optimizeOne(file) {
  const ext = extname(file).toLowerCase();
  if (!SUPPORTED.has(ext)) return null;

  const { size: before } = await stat(file);
  if (before < SKIP_BELOW_BYTES) return null;

  const buf = await readFile(file);
  const img = sharp(buf, { failOn: "none" });
  const meta = await img.metadata();

  let pipeline = img;
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  let out;
  if (ext === ".png") {
    out = await pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true }).toBuffer();
  } else if (ext === ".webp") {
    out = await pipeline.webp({ quality: QUALITY }).toBuffer();
  } else {
    out = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
  }

  if (out.length >= before) return { file, before, after: before, skipped: true };

  await writeFile(file, out);
  return { file, before, after: out.length, skipped: false };
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + "MB";
  return (bytes / 1024).toFixed(1) + "KB";
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for await (const file of walk(TARGET_DIR)) {
    const r = await optimizeOne(file);
    if (!r) continue;
    totalBefore += r.before;
    totalAfter += r.after;
    if (!r.skipped) {
      count++;
      const saved = (((r.before - r.after) / r.before) * 100).toFixed(0);
      console.log(`  ${file}  ${fmt(r.before)} → ${fmt(r.after)}  (-${saved}%)`);
    }
  }

  console.log("");
  console.log(`최적화 완료: ${count}개 파일`);
  console.log(`총 ${fmt(totalBefore)} → ${fmt(totalAfter)} (감소량 ${fmt(totalBefore - totalAfter)})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
