// news-image-20261127: copies the poster for 27 November 2026 world news to
// the output directory. The poster (entry.png, 1024x1024, under 1 MiB) is
// bundled in this repository; this program only validates it and writes it
// out, so both runs produce identical bytes. Node 22, standard library only.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;

const source = new URL('./entry.png', import.meta.url);
const image = readFileSync(source);

if (!image.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}

if (image.length > MAX_BYTES) {
  throw new Error(`entry.png is ${image.length} bytes, over the 1 MiB limit`);
}

// PNG IHDR chunk: width and height are big-endian uint32 at offsets 16 and 20.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), image);
console.log(`wrote entry.png (${width}x${height}, ${image.length} bytes) to ${outDir}`);
