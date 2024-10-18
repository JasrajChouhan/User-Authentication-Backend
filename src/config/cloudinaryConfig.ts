import { v2 as cloudinary } from 'cloudinary';

import serverConfigVariable from './serverConfig';

export async function cloudinaryConfig() {
  try {
    cloudinary.config({
      cloud_name: String(serverConfigVariable.CLOUDINARY_CLOUD_NAME),
      api_key: String(serverConfigVariable.CLOUDINARY_API_SECRET),
      api_secret: String(serverConfigVariable.CLOUDINARY_API_KEY),
    });
  } catch (error: any) {
    console.log('Cloudinary config connection error:', error.message);
  }
}
