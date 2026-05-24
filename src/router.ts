import Express from 'express';
import DataImportController from './controllers/DataImportController';
import HealthcheckController from './controllers/HealthcheckController';
import StudentController from './controllers/StudentController';
import ClassController from './controllers/ClassController';
import ReportController from './controllers/ReportController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', HealthcheckController);
router.use('/class/:classCode', StudentController);
router.use('/class', ClassController);
router.use('/reports', ReportController);

export default router;
