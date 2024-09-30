import { NextFunction, Request, Response } from "express";

import serverConfigVariable from "../config/serverConfig";
import { IUser } from "../models/user.model";
import UserService from '../services/userService';
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

const userService = new UserService();

async function registerUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const user = await userService.create(req.body);

        return res.status(201).json(
            new ApiResponse(201, user, "User register successfully.")
        );
    } catch (error: any) {
        console.error('Error while creating user:', error?.message || error);
        next(new ApiError(
            500,
            error?.message
        ))
    }
}

//------login user

async function loginUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const { loggedInUser, accessToken, refreshToken } = await userService.login(req.body);

        //set the cookie 
        const cookieOptions = {
            httpOnly: true,
            secure: serverConfigVariable.NODE_ENV === 'production',
        }
        res.status(200)
            .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: Number(serverConfigVariable.ACCESS_TOKEN_EXPIREY) })
            .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: Number(serverConfigVariable.REFRESH_TOKEN_EXPIREY) })
            .json(
                new ApiResponse(
                    200,
                    loggedInUser
                )
            )
    } catch (error: any) {
        console.error('Error while creating user:', error?.message || error);
        next(new ApiError(
            500,
            error?.message
        ))
    }
}

//------logout user

async function logoutUser(
    req: Request,
    res: Response,
    next: NextFunction
) {


    try {
        const userId = (req.user as IUser)._id as string;
        const user = await userService.logout(userId)
        const cookieOptions = {
            httpOnly: true,
            secure: serverConfigVariable.NODE_ENV === 'production',
        }

        res.status(200)
            .clearCookie('accessToken', cookieOptions)
            .clearCookie('refreshToken', cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { user },
                    "You are successfully logout"
                )
            )
    } catch (error: any) {
        next(new ApiError(500, error?.message || "Error while logout user."))

    }

}


//----- refresh access token 

async function refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

        const { accessToken, refreshToken } = await userService.refershAccessToken(incomingRefreshToken)

        // set into the secure cookies

        const cookieOptions = {
            httpOnly: true,
            secure: serverConfigVariable.NODE_ENV === 'production',
        }

        res.status(200)
            .cookie('accessToken', accessToken, cookieOptions)
            .cookie('refreshToken', refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Successfully generate new access token."
                )
            )

    } catch (error: any) {
        next(new ApiError(500, error?.message || "Invalid refresht token."))
    }
}

//------ change or update user's password

async function changePassword(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const {
        oldPassword,
        newPassword,
        confiromPassword
    } = req.body

    const userId = (req.user as IUser)._id as string;
    try {
        await userService.changePassword({
            oldPassword,
            newPassword,
            confiromPassword,
            userId
        })
        return res.status(200).json(
            new ApiResponse(200, {}, "Successfully update the password")
        )
    } catch (error: any) {
        next(new ApiError(error.statusCode || 500, error.message || "Something went wrong during changing of password. Please try again letter."))
    }
}

//------ get current user

async function getCurrentLoggedInUser(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const { user } = req;
    try {
        if (!user) {
            throw new ApiError(400, "Cann't find current logged in user. Please try again letter.")
        }

        res.status(200).json(
            new ApiResponse(200, { user })
        )

    } catch (error: any) {
        next(new ApiError(error.statusCode || 500, error?.message || "We can not get details of current user"))
    }

}

//------ change or update user's email

async function changeEmail(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {
        oldEmail,
        newEmail,
    } = req.body;

    try {
        const user = await userService.changeEmail({
            oldEmail,
            newEmail,
        })
        return res.status(200).json(
            new ApiResponse(200, { user }, "Successfully update the email")
        )
    } catch (error: any) {
        next(new ApiError(error.statusCode || 500, error.message || "Something went wrong during changing of email. Please try again letter."))
    }
}

//------ delete user account

async function deleteUserAccount(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req.user as IUser)._id as string;
        const result = await userService.deleteUserAccount(userId)
        if(result) {
            res.status(200).json(
                new ApiResponse(200 ,{} ,  "Your account delete successfully.")
            )
        }
    } catch (error : any) {
        next(new ApiError(error.statusCode || 500 , error.message || "Error while delete user account."))
    }
}


export {
    changeEmail, 
    changePassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    deleteUserAccount
};


