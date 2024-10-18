import { v2 as cloudinary } from 'cloudinary';

import { cloudinaryConfig } from '../config/cloudinaryConfig';
import ApiError from './ApiError';

export async function uploadOnCloudinary(localFile: string) {
  try {
    if (!localFile) {
      throw new ApiError(401, 'Provide an image/avatar');
    }

    // config the cloudinary service
    await cloudinaryConfig();

    if (!cloudinary.config().cloud_name) {
      throw new ApiError(500, 'Cloudinary configuration failed');
    }

    const cloudinaryUploadResult = await cloudinary.uploader.upload(localFile, {
      public_id: 'avatar',
    });
    console.log(cloudinaryUploadResult);
    return cloudinaryUploadResult;
  } catch (error) {
    throw new ApiError(500, 'Error while uploading avatar.');
  }
}
