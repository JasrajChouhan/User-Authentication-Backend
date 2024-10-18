import { Request } from 'express';
import multer from 'multer';
import ApiError from '../utils/ApiError';

export const storage = multer.diskStorage({
  destination(req: Request, file, callback) {
    callback(null, './public/temp');
  },
  filename: function (req: Request, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req: Request, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});
