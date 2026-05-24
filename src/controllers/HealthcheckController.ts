import Express, { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const HealthcheckController = Express.Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health Check
 *     description: Check if the server is running and healthy
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
const healthcheckHandler: RequestHandler = async (req, res) => {
  return res.sendStatus(StatusCodes.OK);
};

HealthcheckController.get("/healthcheck", healthcheckHandler);

export default HealthcheckController;
