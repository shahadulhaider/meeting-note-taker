import multer from 'multer';
import { config } from '../config';
import { AppError } from './error';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only audio files are allowed.', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize,
  },
});
