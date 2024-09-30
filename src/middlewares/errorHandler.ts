import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";

// ------Error-handling middleware
function errorHandler(
    err: ApiError | Error, 
    req: Request,
    res: Response,
    next: NextFunction
) {
    // ---Set default values for properties
    const statusCode = (err instanceof ApiError ? err.statusCode : 500) || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errorName: err.name || "Error",
        stack: process.env.NODE_ENV === "production" ? "" : err.stack, // Stack trace only in development
    });
}

export default errorHandler;
