"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverConfig_1 = __importDefault(require("../config/serverConfig"));
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", stack = "", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.stack = stack;
        this.errors = errors;
        this.data = null;
        //-----check node-env
        const isProduction = serverConfig_1.default.NODE_ENV === 'production';
        if (stack) {
            this.stack = isProduction ? "" : stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.default = ApiError;
