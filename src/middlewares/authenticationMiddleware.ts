import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

import serverConfigVariable from "../config/serverConfig";
import User from "../models/user.model";
import ApiError from "../utils/ApiError";

export interface decodedDataTypes {
    _id : string;
    username : string;
    email : string ;
    password : string ;
}

async function verifyJWT(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const {
            accessToken,
        } = req.cookies || req.header("Authorization")?.replace("Bearer ", "");
    
        const decodedData = jwt.verify(accessToken, serverConfigVariable.ACCESS_TOKEN_SECRET) as decodedDataTypes
    
        // if user don't have decoded token 
        if (!decodedData) {
            throw new ApiError(401, "Unathorized request.")
        }
    
        const user = await User.findById(decodedData?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid access token.")
        }
    
        req.user = user ;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Unauthorized request: Invalid token.");
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Unauthorized request: Token expired.");
        } else {
            // Handle other types of errors
            throw new ApiError(500, "Internal server error.");
        }
    }
}

export default verifyJWT;