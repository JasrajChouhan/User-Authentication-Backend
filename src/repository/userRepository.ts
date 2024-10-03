import jwt from 'jsonwebtoken';

import serverConfigVariable from '../config/serverConfig';
import { decodedDataTypes } from '../middlewares/authenticationMiddleware';
import User, { IUser } from '../models/user.model';
import { changeEmailTypes, changePasswordTypes, userTypes } from '../types/type';
import ApiError from '../utils/ApiError';

class UserRepository {
  async create(data: userTypes) {
    try {
      const { username, email, password } = data;

      // ----validation on every field
      if ([username, email, password].some(value => value?.trim() === '')) {
        throw new ApiError(400, 'Please fill all the fields');
      }

      // ----Check if the user already exists by username or email
      const user = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (user) {
        throw new ApiError(409, 'Username or email already belongs to an account. Please login.');
      }

      // ----Create the new user
      const newUser = await User.create(data);

      // ----Check if the new user was successfully created in the DB
      const createdUser = await User.findById(newUser._id).select('-password -refreshToken');
      if (!createdUser) {
        throw new ApiError(500, 'Something went wrong during user registration. Please try again later.');
      }

      return createdUser;
    } catch (error) {
      // Log the error and rethrow a handled ApiError
      console.error('Error at user repo create level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while creating user.');
    }
  }

  async login(data: userTypes) {
    try {
      const { username, email, password } = data;

      // ----validation on every field

      if (!((username && email) || (email && password))) {
        throw new ApiError(400, 'Please fill all require the fields');
      }

      // ----Check if the user already exists by username or email
      const user = (await User.findOne({ email: email })) as IUser;

      if (!user) {
        throw new ApiError(409, 'Your cradencial are not belongs to any account. Please Signup.');
      }

      async function sameLoginFunclitly(user: IUser) {
        // generate the access and refresh tokens
        const accessToken = (await user.generateAccessToken()) as string;
        const refreshToken = (await user.generateRefreshToken()) as string;

        user.refreshToken = refreshToken;
        await user.save({
          validateBeforeSave: false,
        });

        // remove the refresh-token and password from user before send response to frontend

        const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
        return {
          loggedInUser,
          accessToken,
          refreshToken,
        };
      }

      // if user give username and email for login in system
      if (username && user.username === username) {
        const { loggedInUser, accessToken, refreshToken } = await sameLoginFunclitly(user);
        return {
          loggedInUser,
          accessToken,
          refreshToken,
        };
      } else {
        // if user give password and email for login in system
        const isPasswordMached = await user.comparePassword(password);

        if (!isPasswordMached) {
          throw new ApiError(400, `Wrong cradiencials.`);
        }
        return await sameLoginFunclitly(user);
      }
      return null;
    } catch (error: any) {
      console.error(error.message);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while login user.');
    }
  }

  async logout(userId: string) {
    // first find the user and clear refresh token in db
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    ).select('-password -refreshToken');

    return user;
  }

  async refershAccessToken(incomingRefreshToken: string) {
    try {
      if (!incomingRefreshToken) {
        throw new ApiError(401, 'Please provide refresh token.');
      }

      // verfiy by jwt
      const decodedData = jwt.verify(
        incomingRefreshToken,
        serverConfigVariable.ACCESS_TOKEN_SECRET
      ) as decodedDataTypes;


      const { _id } = decodedData;

      // find the user by _id
      const user = await User.findById(_id);

      if (!user) {
        throw new ApiError(401, 'User not found.');
      }

      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, 'Token expired or used.');
      }

      // then generate new tokens
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error at user repo refresh token level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while refersh token.');
    }
  }

  // change or update user password
  async changePassword(data: changePasswordTypes) {
    const { oldPassword, newPassword, confirmPassword, userId } = data;

    try {
      if ([oldPassword, newPassword, confirmPassword].some(value => value === '')) {
        throw new ApiError(401, 'Please provide all require fields.');
      }

      if(oldPassword === newPassword) {
        throw new ApiError(401, 'Newer and older password can not be same.');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(401, 'Please correctly confrim your password.');
      }

      // find the user by userId into db

      const user = (await User.findById(userId)) as IUser;

      const isPasswordMached = await user?.comparePassword(oldPassword);

      if (!isPasswordMached) {
        throw new ApiError(401, 'Please provide correct password.');
      }

      // set new-password into db or update the password
      user.password = newPassword;
      user?.save({
        validateBeforeSave: false,
      });
    } catch (error) {
      console.error('Error at user repo change password level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while change of password.');
    }
  }

  async changeEmail(data: changeEmailTypes) {
    try {
      const { oldEmail, newEmail } = data;

      // check user provide all require fields
      if (!oldEmail || !newEmail) {
        throw new ApiError(400, 'Please provide all required filds.');
      }

      if (oldEmail === newEmail) {
        throw new ApiError(400, 'Please provide different email.');
      }

      // any user belongs to oldEmail

      const user = (await User.findOne({ email : oldEmail }).select('-password -refreshToken')) as IUser;

      if (!user) {
        throw new ApiError(400, 'Please provide correct older email.');
      }

      user.email = newEmail;
      user.save({
        validateBeforeSave: false,
      });

      return user;
    } catch (error) {
      console.error('Error at user repo change email level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while change of email.');
    }
  }

  // Delete user function
  async deleteUserAccount(userId: string | number): Promise<boolean> {
    try {
      // Try to delete the user by ID
      const result = await User.deleteOne({ _id: userId });

      // Check if the user was deleted successfully
      if (result.deletedCount !== 1) {
        throw new ApiError(404, 'User not found. Unable to delete.');
      }

      return true;
    } catch (error) {
      // Log the error and rethrow as ApiError
      console.error('Error at user repo destroy level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(500, 'Error while deleting user.');
    }
  }
}

export default UserRepository;
