import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { getWorkloadReport } from '../services/ReportService';

const ReportController = Express.Router();
const LOG = new Logger('ReportController.ts');

const workloadReportHandler: RequestHandler = async (req, res, next) => {
  try {
    LOG.info('Generating workload report');
    const report = await getWorkloadReport();
    return res.status(StatusCodes.OK).json(report);
  } catch (err) {
    next(err);
  }
};

ReportController.get('/workload', workloadReportHandler);

export default ReportController;
