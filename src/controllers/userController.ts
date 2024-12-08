import { NextFunction, Request, Response } from 'express';

import serverConfigVariable from '../config/serverConfig';
import UserService from '../services/user.service';
import { LoginResponse, MulterRequest } from '../types/type';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import sendToken from '../utils/SendToken';

const userService = new UserService();

async function registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const user = await userService.create(req.body);

    return res.status(201).json(new ApiResponse(201, user, 'User register successfully.'));
  } catch (error: any) {
    console.error('Error while creating user:', error?.message || error);

    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Error while register user'));
  }
}

//------login user

async function loginUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { loggedInUser, accessToken, refreshToken } = (await userService.login(req.body)) as LoginResponse;
    sendToken(accessToken, refreshToken, loggedInUser, res);
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Error while login user'));
  }
}

//------logout user

async function logoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('req.user', req.user);
    const userId = req.user?._id as string;
    const user = await userService.logout(userId);
    const cookieOptions = {
      httpOnly: true,
      secure: serverConfigVariable.NODE_ENV === 'production',
    };

    res
      .status(200)
      .clearCookie('accessToken', { ...cookieOptions, sameSite: 'strict' })
      .clearCookie('refreshToken', { ...cookieOptions, sameSite: 'strict' })
      .json(new ApiResponse(200, { user }, 'You are successfully logout'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Error while logout user'));
  }
}

//----- refresh access token

async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken } = await userService.refershAccessToken(incomingRefreshToken);

    // set into the secure cookies

    const cookieOptions = {
      httpOnly: true,
      secure: serverConfigVariable.NODE_ENV === 'production',
    };

    res
      .status(200)
      .cookie('accessToken', accessToken, { ...cookieOptions, sameSite: 'strict' })
      .cookie('refreshToken', refreshToken, { ...cookieOptions, sameSite: 'strict' })
      .json(new ApiResponse(200, {}, 'Successfully generate new access token.'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Invalid refresht token.'));
  }
}

//------ change or update user's password

async function changePassword(req: Request, res: Response, next: NextFunction) {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const userId = req.user?._id as string;
  try {
    await userService.changePassword({
      oldPassword,
      newPassword,
      confirmPassword,
      userId,
    });
    return res.status(200).json(new ApiResponse(200, {}, 'Successfully update the password'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          {},
          error?.message || 'Something went wrong during changing of password. Please try again letter.'
        )
      );
  }
}

//------ get current user

async function getCurrentLoggedInUser(req: Request, res: Response, next: NextFunction) {
  const { user } = req;
  try {
    if (!user) {
      throw new ApiError(400, "Cann't find current logged in user. Please try again letter.");
    }

    res.status(200).json(new ApiResponse(200, { user }));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'We can not get details of current user'));
  }
}

//------ change or update user's email

async function changeEmail(req: Request, res: Response, next: NextFunction) {
  const { oldEmail, newEmail } = req.body;

  try {
    const user = await userService.changeEmail({
      oldEmail,
      newEmail,
    });
    return res.status(200).json(new ApiResponse(200, { user }, 'Successfully update the email'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          {},
          error?.message || 'Something went wrong during changing of email. Please try again letter.'
        )
      );
  }
}

//------ delete user account

async function deleteUserAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user?._id as string) || '';
    const result = await userService.deleteUserAccount(userId);
    if (result) {
      res.status(200).json(new ApiResponse(200, {}, 'Your account delete successfully.'));
    }
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Error while delete user account.'));
  }
}

async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = req.params;
    const user = await userService.getUserById(userId);
    return res.status(200).json(new ApiResponse(200, { user }, 'Successfully get the user details.'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message || 'Error while fetching user deatls.'));
  }
}

//---- google oauth

async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.googleAuth(req.body);
    console.log('Full Result:', result);

    if (result && result.refreshToken && result.accessToken) {
      const { accessToken, refreshToken, loggedInUser } = result;
      sendToken(accessToken, refreshToken, loggedInUser, res);
    }
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          {},
          error?.message || 'Token generation failed' || 'Error while fetching user deatls.'
        )
      );
  }
}

//--- check username exist or not in db

async function isUsernameExist(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req?.body;

    const result = await userService.isUsernameExist(username);

    res
      .status(result ? 200 : 401)
      .json(
        new ApiResponse(result ? 200 : 401, {}, result ? `${username} is available` : `${username} is not available`)
      );
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(error.statusCode || 500, {}, error.message || 'Error while checking existence of username')
      );
  }
}

//---- upload avatar and save into db
async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?._id as string;
    const localFilePath = (req as MulterRequest).file?.path as string;
    await userService.uploadAvatar(localFilePath, userId);

    // send the response
    res.status(200).json(new ApiResponse(200, {}, 'Successfully upload or update avatar.'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error.message || 'Error while upload avatar.'));
  }
}
export {
  changeEmail,
  changePassword,
  deleteUserAccount,
  getCurrentLoggedInUser,
  getUserById,
  googleAuth,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  isUsernameExist,
  uploadAvatar,
};
