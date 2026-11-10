import { closeSync, constants, fstatSync, lstatSync, openSync, readSync } from 'node:fs';

// Opening before inspecting makes every check describe the file that is read, not whatever the path named a
// moment earlier. O_NOFOLLOW refuses a link where supported and O_NONBLOCK keeps a FIFO from blocking the open.
// Windows opens through a link, so the path must still name the opened file afterwards.
const flags = constants.O_RDONLY | (process.platform === 'win32' ? 0 : constants.O_NOFOLLOW | constants.O_NONBLOCK);

export interface RegularFileBounds {
  readonly maxBytes: number;
  readonly minBytes?: number;
  /** Also reject files with more than one hard link. */
  readonly singleLink?: boolean;
}

/** Reads a bounded regular file through one descriptor; `reject` throws the caller's own error. */
export function readRegularFileSync(path: string, bounds: RegularFileBounds, reject: () => never): Buffer {
  let descriptor: number;
  try { descriptor = openSync(path, flags); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ELOOP') reject();
    throw error;
  }
  try {
    const opened = fstatSync(descriptor, { bigint: true });
    const entry = lstatSync(path, { bigint: true });
    if (!opened.isFile() || entry.isSymbolicLink() || entry.dev !== opened.dev || entry.ino !== opened.ino
      || (bounds.singleLink === true && opened.nlink !== 1n) || opened.size > BigInt(bounds.maxBytes)) reject();
    const chunks: Buffer[] = [];
    let length = 0;
    for (;;) {
      const chunk = Buffer.allocUnsafe(Math.min(64 * 1024, bounds.maxBytes + 1 - length));
      const read = readSync(descriptor, chunk, 0, chunk.length, null);
      if (read === 0) break;
      length += read;
      if (length > bounds.maxBytes) reject();
      chunks.push(chunk.subarray(0, read));
    }
    if (length < (bounds.minBytes ?? 0)) reject();
    return Buffer.concat(chunks, length);
  } finally { closeSync(descriptor); }
}
