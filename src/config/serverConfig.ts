import dotenv from 'dotenv';
dotenv.config();

const serverConfigVariable = {
  PORT: process.env.PORT as string,
  SALT_WORK_FACTOR: process.env.SALT_WORK_FACTOR,
  MONGO_DB_URI: process.env.MONGO_DB_URI as string,
  ACCESS_TOKEN_EXPIREY: process.env.ACCESS_TOKEN_EXPIREY as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  REFRESH_TOKEN_EXPIREY: process.env.REFRESH_TOKEN_EXPIREY as string,
  NODE_ENV: process.env.NODE_ENV as string,
};

export default serverConfigVariable;
