import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../config/logger';
import { updateClassName } from '../services/ClassService';
import BadRequestError from '../errors/BadRequestError';

const ClassController = Express.Router();
const LOG = new Logger('ClassController.ts');

const updateClassNameHandler: RequestHandler<{ classCode: string }> = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const { className } = req.body;

    if (!className || typeof className !== 'string' || className.trim() === '') {
      throw new BadRequestError('Request body must contain a non-empty "className" string');
    }

    LOG.info(`Updating class name for '${classCode}' to '${className}'`);

    await updateClassName(classCode, className.trim());
    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

ClassController.put('/:classCode', updateClassNameHandler);

export default ClassController;
