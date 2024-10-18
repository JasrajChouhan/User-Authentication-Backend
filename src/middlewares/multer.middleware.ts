import multer from 'multer'
import { Request } from 'express'

export const storage = multer.diskStorage({
  destination(req : Request, file, callback) {
    callback(null , '/src/temp/uploads')
  },
  filename: function (req : Request, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({
  storage : storage
})