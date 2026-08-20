import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE, MAX_CSV_SIZE } from '@printfection/config';
import { ApiError } from '../utils/ApiError';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid image type') as unknown as null, false);
  }
};

const csvFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only CSV files are allowed') as unknown as null, false);
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: imageFilter,
});

export const uploadCsv = multer({
  storage,
  limits: { fileSize: MAX_CSV_SIZE },
  fileFilter: csvFilter,
});
