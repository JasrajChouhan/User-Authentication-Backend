import bcrypt, { genSalt } from 'bcrypt';
import jwt from 'jsonwebtoken';

import serverConfigVariable from '../config/serverConfig';
import { decodedDataTypes } from '../middlewares/authenticationMiddleware';
import User, { IUser } from '../models/user.model';
import ApiError from '../utils/ApiError';

import { changeEmailTypes, changePasswordTypes, GoogleOAuthProps, userTypes } from '../types/type';
import generateValidUsername from '../utils/generateValidUsername';
import { uploadOnCloudinary } from '../utils/uploadOnCloudinary';

const SALT_WORK_FACTOR = Number(serverConfigVariable.SALT_WORK_FACTOR || 10);

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
    } catch (error: any) {
      // Log the error and rethrow a handled ApiError
      console.error('Error at user repo create level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(error.statusCode || 500, error?.message || 'Error while creating user.');
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
      throw new ApiError(error.statusCode || 500, error?.message || 'Error while login user.');
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
        serverConfigVariable.REFRESH_TOKEN_SECRET
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
    } catch (error: any) {
      console.error('Error at user repo refresh token level:', error.name);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(error.statusCode || 500, error.message || 'Error while refersh token.');
    }
  }

  // change or update user password
  async changePassword(data: changePasswordTypes) {
    const { oldPassword, newPassword, confirmPassword, userId } = data;
    console.log(oldPassword, newPassword, confirmPassword);
    try {
      if (
        [oldPassword, newPassword, confirmPassword].some(
          value => value?.trim() === '' || value === undefined || value === null
        )
      ) {
        throw new ApiError(401, 'Please provide all require fields.');
      }

      if (oldPassword === newPassword) {
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
    } catch (error: any) {
      console.error('Error at user repo change password level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      // Throw a generic error wrapped as an ApiError
      throw new ApiError(error.statusCode || 500, error?.message || 'Error while change of password.');
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

      const user = (await User.findOne({ email: oldEmail }).select('-password -refreshToken')) as IUser;

      if (!user) {
        throw new ApiError(400, 'Please provide correct older email.');
      }

      user.email = newEmail;
      user.save({
        validateBeforeSave: false,
      });

      return user;
    } catch (error: any) {
      console.error('Error at user repo change email level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      // Throw a generic error wrapped as an ApiError
      throw new ApiError(error.statusCode || 500, error?.message || 'Error while change of email.');
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
    } catch (error: any) {
      // Log the error and rethrow as ApiError
      console.error('Error at user repo destroy level:', error);

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Throw a generic error wrapped as an ApiError
      throw new ApiError(error.statusCode || 500, error?.message || 'Error while deleting user.');
    }
  }

  // get user by id (By authorized user)

  async getUserById(userId: string) {
    try {
      if (!userId) {
        throw new ApiError(400, 'Please provide userId.');
      }

      const user = await User.findById(userId).select('-password -refreshToken');
      if (!user) {
        throw new ApiError(400, `User not found whith userId ${userId}`);
      }

      return user;
    } catch (error: any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error while fetching user details.');
    }
  }

  // oauth
  async googleAuth(data: GoogleOAuthProps) {
    try {
      const { username, email, avatar } = data;

      if (!username || !email) {
        throw new ApiError(400, 'Please provide all required fields.');
      }

      // Check if the user exists by username or email
      const user = await User.findOne({
        $or: [{ username }, { email }],
      }).select('-password -refreshToken');

      if (user) {
        // User exists, generate tokens
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        return { loggedInUser: user, accessToken, refreshToken };
      } else {
        // Generate unique username
        let uniqueUsername = generateValidUsername(username);

        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = generateValidUsername(username);
        }

        // Generate a random password and hash it
        const generatedPassword = Math.random().toString(36).slice(-9) + Math.random().toString(36).slice(-9);
        const salt = await genSalt(SALT_WORK_FACTOR);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create new user
        const newUser = await User.create({
          username: uniqueUsername,
          password: hashedPassword.substring(0, 18),
          email: email,
          avatar: avatar,
        });

        const createdUser = await User.findById(newUser._id).select('-password -refreshToken');
        if (!createdUser) {
          throw new ApiError(500, 'User registration failed.');
        }

        // Generate tokens for the new user
        const accessToken = await createdUser.generateAccessToken();
        const refreshToken = await createdUser.generateRefreshToken();

        return { loggedInUser: createdUser, accessToken, refreshToken };
      }
    } catch (error: any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error during Google auth process.');
    }
  }

  // username exist or not in db

  async isUsernameExist(username: string) {
    try {
      if (!username) {
        throw new ApiError(400, 'Please provide a username.');
      }

      // check username is follow our regex pattern or not

      const usernameRegExp = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
      const isMatch = usernameRegExp.test(username);

      if (!isMatch) {
        throw new ApiError(400, 'Give a valid username');
      }

      const user = await User.findOne({ username }).select('-password -refreshToken');

      if (user) {
        throw new ApiError(400, `${username} is not available`);
      }
      return true;
    } catch (error: any) {
      console.log(error);
      throw new ApiError(error.statusCode || 500, error.message || 'Error while checking existance of username.');
    }
  }

  // upload avatar on cloudinary

  async uploadAvatar(localFilePath: string, userId: string) {
    try {
      if (!localFilePath) {
        throw new ApiError(500, 'Localfile path is not available.');
      }

      // then upload on cloudinary
      const uploadCloudinaryResult = await uploadOnCloudinary(localFilePath);
      console.log(uploadCloudinaryResult.url);
      const { url: avatarImageUrl } = uploadCloudinaryResult;
      if (!avatarImageUrl) {
        throw new ApiError(500, 'Image url not found. Try again letter.');
      }

      // then save the image url in db
      await User.findByIdAndUpdate(userId, {
        avatar: avatarImageUrl,
      }).select('-password -refreshToken');
    } catch (error: any) {
      console.log(error);
      throw new ApiError(error.statusCode || 500, error.message || 'Error while upload avatar');
    }
  }
}

export default UserRepository;
