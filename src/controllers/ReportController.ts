import Express, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../config/logger";
import { getWorkloadReport } from "../services/ReportService";

const ReportController = Express.Router();
const LOG = new Logger("ReportController.ts");

/**
 * @swagger
 * /reports/workload:
 *   get:
 *     summary: Get Workload Report
 *     description: Generate a workload report showing all teachers and their class assignments
 *     tags:
 *       - Reports
 *     responses:
 *       200:
 *         description: Workload report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkloadReport'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const workloadReportHandler: RequestHandler = async (req, res, next) => {
  try {
    LOG.info("Generating workload report");
    const report = await getWorkloadReport();
    return res.status(StatusCodes.OK).json(report);
  } catch (err) {
    next(err);
  }
};

ReportController.get("/workload", workloadReportHandler);

export default ReportController;
