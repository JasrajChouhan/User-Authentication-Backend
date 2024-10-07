import { Response } from 'express';
import serverConfigVariable from '../config/serverConfig';
import { IUser } from '../models/user.model';
import { ICookieOptions } from '../types/type';
import ApiResponse from './ApiResponse';
import ApiError from './ApiError';

async function sendToken(accessToken: string, refreshToken: string, loggedInUser: IUser, res: Response) {
  try {
    // Expirey of access-token and refresh-token
    const accessTokenExpire = parseInt(serverConfigVariable.ACCESS_TOKEN_EXPIREY) * 1000;
    const refreshTokenExpire = parseInt(serverConfigVariable.REFRESH_TOKEN_EXPIREY) * 1000;

    //set the cookie options for access token
    const isProduction = serverConfigVariable.NODE_ENV === 'production' ? true : false;
    const accessTokenCookieOptions: ICookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProduction,
      expires: new Date(Date.now() + accessTokenExpire * 1000),
      maxAge: accessTokenExpire * 1000,
    };

    //set the cookie options for refresh token
    const refreshTokenCookieOptions: ICookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      expires: new Date(Date.now() + refreshTokenExpire * 1000),
      maxAge: refreshTokenExpire * 1000,
    };
    res
      .status(200)
      .cookie('accessToken', accessToken, accessTokenCookieOptions)
      .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
      .json(new ApiResponse(200, { user: loggedInUser }));
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || 'Something went wrong during sending of token.');
  }
}

export default sendToken;
