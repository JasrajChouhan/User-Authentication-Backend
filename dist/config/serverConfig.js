"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const serverConfigVariable = {
    PORT: process.env.PORT,
    SALT_WORK_FECTOR: process.env.SALT_WORK_FECTOR,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    ACCESS_TOKEN_EXPIREY: process.env.ACCESS_TOKEN_EXPIREY,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIREY: process.env.REFRESH_TOKEN_EXPIREY,
    NODE_ENV: process.env.NODE_ENV,
};
exports.default = serverConfigVariable;
