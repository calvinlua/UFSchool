import Express from 'express';
import DataImportController from './controllers/DataImportController';
import HealthcheckController from './controllers/HealthcheckController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', HealthcheckController);

export default router;
