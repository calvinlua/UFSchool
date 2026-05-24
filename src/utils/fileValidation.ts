import fs from 'fs';
import BadRequestError from '../errors/BadRequestError';

interface BinarySignature {
  /** Raw byte values at offset 0 that identify the format. */
  signature: number[];
  /** Human-readable format label used in the error message. */
  label: string;
}

/**
 * Known binary file magic numbers (file signatures).
 *
 * CSV is plain text and has NO magic number.  The strategy is therefore the
 * inverse: if the first bytes match ANY known binary signature we reject the
 * file, otherwise we allow it through.
 *
 * Reference: https://en.wikipedia.org/wiki/List_of_file_signatures
 */
const BINARY_SIGNATURES: BinarySignature[] = [
  { signature: [0x25, 0x50, 0x44, 0x46], label: 'PDF'                 }, // %PDF
  { signature: [0x50, 0x4B, 0x03, 0x04], label: 'ZIP / XLSX / DOCX'   }, // PK\x03\x04
  { signature: [0x50, 0x4B, 0x05, 0x06], label: 'ZIP (empty)'          }, // PK\x05\x06
  { signature: [0x89, 0x50, 0x4E, 0x47], label: 'PNG'                  }, // \x89PNG
  { signature: [0xFF, 0xD8, 0xFF],        label: 'JPEG'                 }, // JFIF SOI
  { signature: [0x47, 0x49, 0x46, 0x38], label: 'GIF'                  }, // GIF8
  { signature: [0x42, 0x4D],             label: 'BMP'                  }, // BM
  { signature: [0xD0, 0xCF, 0x11, 0xE0], label: 'MS Office DOC / XLS'  }, // \xD0\xCF\x11\xE0
  { signature: [0x7F, 0x45, 0x4C, 0x46], label: 'ELF binary'           }, // \x7FELF
  { signature: [0x1F, 0x8B],             label: 'GZIP'                 }, // \x1F\x8B
  { signature: [0x42, 0x5A, 0x68],       label: 'BZIP2'                }, // BZh
  { signature: [0x52, 0x61, 0x72, 0x21], label: 'RAR'                  }, // Rar!
];

/** How many bytes to read — covers the longest signature above. */
const BYTES_TO_READ = 8;

/**
 * Reads the first few bytes of an on-disk file and checks them against
 * a table of known binary file signatures.
 *
 * Throws BadRequestError if the file is identified as a binary format,
 * which means a user has attempted to upload a non-CSV file with a `.csv`
 * extension or a `text/csv` Content-Type.
 *
 * A file that does NOT match any known binary signature is considered
 * potentially valid plain-text (CSV passes this check).
 */
export const checkMagicNumber = async (filePath: string): Promise<void> => {
  const buffer = Buffer.alloc(BYTES_TO_READ);
  const handle = await fs.promises.open(filePath, 'r');

  try {
    await handle.read(buffer, 0, BYTES_TO_READ, 0);
  } finally {
    await handle.close();
  }

  for (const { signature, label } of BINARY_SIGNATURES) {
    if (signature.every((byte, i) => buffer[i] === byte)) {
      throw new BadRequestError(
        `Invalid file: ${label} binary content detected. Only plain-text CSV files are accepted.`,
      );
    }
  }
};
