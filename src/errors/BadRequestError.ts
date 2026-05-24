import { StatusCodes } from 'http-status-codes';
import ErrorBase from './ErrorBase';
import ErrorCodes from '../const/ErrorCodes';

class BadRequestError extends ErrorBase {
  constructor(message: string) {
    super(message, ErrorCodes.BAD_REQUEST_ERROR_CODE, StatusCodes.BAD_REQUEST);
  }
}

export default BadRequestError;
