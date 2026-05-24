import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { getStudentsForClass } from '../services/StudentService';
import BadRequestError from '../errors/BadRequestError';

const StudentController = Express.Router({ mergeParams: true });
const LOG = new Logger('StudentController.ts');

const getStudentsHandler: RequestHandler<{ classCode: string }> = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const offset = parseInt(req.query.offset as string, 10);
    const limit  = parseInt(req.query.limit  as string, 10);

    if (isNaN(offset) || offset < 0) {
      throw new BadRequestError('Query param "offset" must be a non-negative integer');
    }
    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestError('Query param "limit" must be a positive integer');
    }

    LOG.info(`Fetching students for class '${classCode}' offset=${offset} limit=${limit}`);

    const result = await getStudentsForClass(classCode, offset, limit);
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

StudentController.get('/students', getStudentsHandler);

export default StudentController;
