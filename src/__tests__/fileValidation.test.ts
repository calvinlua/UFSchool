import * as fs from 'fs';
import { checkMagicNumber } from '../utils/fileValidation';
import BadRequestError from '../errors/BadRequestError';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Mocks fs.promises.open so that handle.read() fills the buffer with
 * the provided bytes (padded with 0x00 to 8 bytes).
 */
const mockFileBytes = (bytes: number[]): void => {
  const paddedBytes = [...bytes, ...Array(8).fill(0x00)].slice(0, 8);

  const mockHandle = {
    read: jest.fn().mockImplementation(async (buffer: Buffer) => {
      paddedBytes.forEach((byte, i) => { buffer[i] = byte; });
      return { bytesRead: paddedBytes.length, buffer };
    }),
    close: jest.fn().mockResolvedValue(undefined),
  };

  jest.spyOn(fs.promises, 'open').mockResolvedValue(
    mockHandle as unknown as fs.promises.FileHandle,
  );
};

afterEach(() => jest.restoreAllMocks());

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkMagicNumber', () => {
  // ── Binary formats that must be rejected ────────────────────────────────────
  const binaryCases: Array<{ label: string; bytes: number[] }> = [
    { label: 'PDF',                 bytes: [0x25, 0x50, 0x44, 0x46] },          // %PDF
    { label: 'ZIP / XLSX / DOCX',   bytes: [0x50, 0x4B, 0x03, 0x04] },          // PK\x03\x04
    { label: 'PNG',                 bytes: [0x89, 0x50, 0x4E, 0x47] },          // \x89PNG
    { label: 'JPEG',                bytes: [0xFF, 0xD8, 0xFF]        },          // JPEG SOI
    { label: 'GIF',                 bytes: [0x47, 0x49, 0x46, 0x38] },          // GIF8
    { label: 'BMP',                 bytes: [0x42, 0x4D]              },          // BM
    { label: 'MS Office DOC / XLS', bytes: [0xD0, 0xCF, 0x11, 0xE0] },          // DOC/XLS
    { label: 'ELF binary',          bytes: [0x7F, 0x45, 0x4C, 0x46] },          // \x7FELF
    { label: 'GZIP',                bytes: [0x1F, 0x8B]              },          // GZ
    { label: 'BZIP2',               bytes: [0x42, 0x5A, 0x68]        },          // BZh
    { label: 'RAR',                 bytes: [0x52, 0x61, 0x72, 0x21] },          // Rar!
  ];

  it.each(binaryCases)(
    'rejects a $label file with a BadRequestError',
    async ({ label, bytes }) => {
      mockFileBytes(bytes);
      await expect(checkMagicNumber('/fake/path')).rejects.toBeInstanceOf(BadRequestError);
      await expect(checkMagicNumber('/fake/path')).rejects.toMatchObject({
        message: expect.stringContaining(label),
      });
    },
  );

  // ── Text / CSV files that must pass ─────────────────────────────────────────
  it('accepts a plain-text CSV (no magic bytes)', async () => {
    // Starts with the letter 't' (teacherEmail header) — no binary signature
    mockFileBytes([0x74, 0x65, 0x61, 0x63, 0x68, 0x65, 0x72, 0x45]); // "teacherE"
    await expect(checkMagicNumber('/valid.csv')).resolves.toBeUndefined();
  });

  it('accepts a UTF-8 BOM CSV (EF BB BF prefix)', async () => {
    // UTF-8 BOM is valid text — not a binary magic number
    mockFileBytes([0xEF, 0xBB, 0xBF, 0x74, 0x65, 0x61, 0x63, 0x68]); // BOM + "teach"
    await expect(checkMagicNumber('/bom-csv.csv')).resolves.toBeUndefined();
  });

  it('closes the file handle even when a bad signature is detected', async () => {
    const mockClose = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(fs.promises, 'open').mockResolvedValue({
      read: jest.fn().mockImplementation(async (buffer: Buffer) => {
        [0x25, 0x50, 0x44, 0x46].forEach((b, i) => { buffer[i] = b; }); // PDF
        return { bytesRead: 4, buffer };
      }),
      close: mockClose,
    } as unknown as fs.promises.FileHandle);

    await expect(checkMagicNumber('/fake/path')).rejects.toBeInstanceOf(BadRequestError);
    expect(mockClose).toHaveBeenCalledTimes(1); // handle was closed in finally
  });
});
