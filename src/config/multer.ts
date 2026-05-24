import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = '/tmp/school-administration-system-uploads';

// Ensure the upload directory exists before multer tries to write into it.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

/** Accept only CSV files (by extension and MIME type). */
const csvFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
  const hasCsvExtension = path.extname(file.originalname).toLowerCase() === '.csv';

  if (hasCsvExtension || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are accepted'));
  }
};

const upload = multer({ storage: diskStorage, fileFilter: csvFileFilter });

export default upload;
