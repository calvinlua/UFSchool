import fs from 'fs';
import csv from 'csv-parser';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { CsvItem } from 'CsvItem';

export const convertCsvToJson = (filePath: string): Promise<CsvItem[]> => {
  const results: CsvItem[] = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  return new Promise((resolve, reject) => {
    stream.on('data', (data: CsvItem) => results.push(data));
    stream.on('end', () => resolve(results));
    stream.on('error', (err) => reject(err));
  });
};

/** Wraps an async route handler so thrown errors are forwarded to next(). */
export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
