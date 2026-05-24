import Express, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../config/logger";
import { getStudentsForClass } from "../services/StudentService";
import BadRequestError from "../errors/BadRequestError";

const StudentController = Express.Router({ mergeParams: true });
const LOG = new Logger("StudentController.ts");

/**
 * @swagger
 * /class/{classCode}/students:
 *   get:
 *     summary: Get Students by Class
 *     description: Retrieve paginated list of students in a specific class
 *     tags:
 *       - Students
 *     parameters:
 *       - name: classCode
 *         in: path
 *         description: Unique class identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: CLASS-001
 *       - name: offset
 *         in: query
 *         description: Number of records to skip (must be >= 0)
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         example: 0
 *       - name: limit
 *         in: query
 *         description: Number of records to return (must be > 0)
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 10
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStudentResponse'
 *       400:
 *         description: Bad Request - Invalid offset or limit parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Not Found - Class does not exist
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
const getStudentsHandler: RequestHandler<{ classCode: string }> = async (
  req,
  res,
  next,
) => {
  try {
    const { classCode } = req.params;
    const offset = parseInt(req.query.offset as string, 10);
    const limit = parseInt(req.query.limit as string, 10);

    if (isNaN(offset) || offset < 0) {
      throw new BadRequestError(
        'Query param "offset" must be a non-negative integer',
      );
    }
    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestError(
        'Query param "limit" must be a positive integer',
      );
    }

    LOG.info(
      `Fetching students for class '${classCode}' offset=${offset} limit=${limit}`,
    );

    const result = await getStudentsForClass(classCode, offset, limit);
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

StudentController.get("/students", getStudentsHandler);

export default StudentController;
