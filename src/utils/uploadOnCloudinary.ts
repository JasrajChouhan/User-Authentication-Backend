import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { cloudinaryConfig } from '../config/cloudinaryConfig';
import ApiError from './ApiError';

export async function uploadOnCloudinary(localFilePath: string) {
  try {
    if (!localFilePath) {
      throw new ApiError(401, 'Provide an image/avatar');
    }

    // config the cloudinary service
    await cloudinaryConfig();

    if (!cloudinary.config().cloud_name) {
      throw new ApiError(500, 'Cloudinary configuration failed');
    }

    const cloudinaryUploadResult = await cloudinary.uploader.upload(localFilePath, {
      public_id: 'avatar',
    });
    return cloudinaryUploadResult;
  } catch (error: any) {
    fs.unlinkSync(localFilePath);
    throw new ApiError(error.statusCode || 500, error.message || 'Error while uploading avatar.');
  }
}
