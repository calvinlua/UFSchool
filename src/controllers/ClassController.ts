import Express, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from "../config/logger";
import { updateClassName } from "../services/ClassService";
import BadRequestError from "../errors/BadRequestError";

const ClassController = Express.Router();
const LOG = new Logger("ClassController.ts");

/**
 * @swagger
 * /class/{classCode}:
 *   put:
 *     summary: Update Class Name
 *     description: Update the name of a specific class
 *     tags:
 *       - Classes
 *     parameters:
 *       - name: classCode
 *         in: path
 *         description: Unique class identifier
 *         required: true
 *         schema:
 *           type: string
 *         example: CLASS-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClassNameRequest'
 *     responses:
 *       204:
 *         description: Class name updated successfully
 *       400:
 *         description: Bad Request - Missing or invalid className
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
const updateClassNameHandler: RequestHandler<{ classCode: string }> = async (
  req,
  res,
  next,
) => {
  try {
    const { classCode } = req.params;
    const { className } = req.body;

    if (
      !className ||
      typeof className !== "string" ||
      className.trim() === ""
    ) {
      throw new BadRequestError(
        'Request body must contain a non-empty "className" string',
      );
    }

    LOG.info(`Updating class name for '${classCode}' to '${className}'`);

    await updateClassName(classCode, className.trim());
    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

ClassController.put("/:classCode", updateClassNameHandler);

export default ClassController;
