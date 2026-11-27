// news-image-20261127 entry program (Node 22, standard library only).
//
// The poster for Friday 27 November 2026 lives in this repository as
// entry.png. This program checks the file and copies it, byte for byte, to
// the output directory, so running it twice writes the same bytes both times.
//
// Usage:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAX_FILE_BYTES = 1048576;

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const bytes = readFileSync(join(here, 'entry.png'));

  const signature = Array.from(bytes.subarray(0, 8));
  if (signature.join(',') !== PNG_SIGNATURE.join(',')) {
    throw new Error('entry.png does not start with the PNG signature');
  }

  if (bytes.length > MAX_FILE_BYTES) {
    throw new Error(`entry.png is ${bytes.length} bytes, above the 1 MiB limit`);
  }

  // The PNG IHDR chunk stores width and height as big-endian uint32 values
  // at byte offsets 16 and 20. Both sides must fit inside 1024 pixels.
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`entry.png is ${width}x${height}, above the 1024x1024 limit`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'entry.png'), bytes);
  console.log(`copied entry.png (${width}x${height}, ${bytes.length} bytes) to ${outDir}`);
}

main();
