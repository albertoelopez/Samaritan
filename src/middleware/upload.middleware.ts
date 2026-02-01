import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF'));
  }
};

const documentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Allowed: PDF, JPEG, PNG'));
  }
};

const generalFileFilter = (
  _req: Request,
  _file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  cb(null, true);
};

// Memory storage for processing before S3 upload
const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: imageFileFilter,
});

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 10,
  },
  fileFilter: imageFileFilter,
});

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: documentFileFilter,
});

export const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: documentFileFilter,
});

export const uploadFile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: generalFileFilter,
});

export const uploadFiles = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: generalFileFilter,
});

// Error handler for multer errors
export const handleMulterError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: (err?: Error) => void
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('File too large'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new BadRequestError('Too many files'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new BadRequestError('Unexpected file field'));
    }
    return next(new BadRequestError(err.message));
  }
  next(err);
};

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}
