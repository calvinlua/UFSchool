import fs from "fs";
import Express, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../config/logger";
import upload from "../config/multer";
import { convertCsvToJson } from "../utils";
import { checkMagicNumber } from "../utils/fileValidation";
import { processImport } from "../services/DataImportService";
import BadRequestError from "../errors/BadRequestError";

const DataImportController = Express.Router();
const LOG = new Logger("DataImportController.ts");

/** Silently removes the multer temp file; logs a warning on failure. */
const cleanupTempFile = (filePath: string): void => {
  fs.unlink(filePath, (err) => {
    if (err)
      LOG.warn(`Failed to remove temp file '${filePath}': ${err.message}`);
  });
};

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Import CSV Data
 *     description: Import student, class, and teacher data from a CSV file
 *     tags:
 *       - Data Import
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing student and class data
 *             required:
 *               - data
 *     responses:
 *       204:
 *         description: Data imported successfully
 *       400:
 *         description: Bad Request - Invalid CSV format or missing file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const dataImportHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        "A CSV file is required (multipart field name: data)",
      );
    }

    LOG.info(`Processing uploaded file: ${req.file.originalname}`);

    // Reject binary files disguised as CSVs by inspecting raw magic bytes.
    await checkMagicNumber(req.file.path);

    const rows = await convertCsvToJson(req.file.path);
    await processImport(rows);

    LOG.info(`Successfully imported ${rows.length} CSV row(s)`);
    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  } finally {
    // Always clean up the temp file, whether the import succeeded or failed.
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
  }
};

DataImportController.post("/upload", upload.single("data"), dataImportHandler);

export default DataImportController;
