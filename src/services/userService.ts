import UserRepository from '../repository/userRepository';
import { changeEmailTypes, changePasswordTypes, GoogleOAuthProps, userTypes } from '../types/type';
import ApiError from '../utils/ApiError';

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data: userTypes) {
    try {
      const user = await this.userRepository.create(data);
      console.log(user);
      return user;
    } catch (error) {
      console.log(`Error at service level:`, error);
      throw error;
    }
  }

  async login(data: userTypes) {
    try {
      return await this.userRepository.login(data);
      // return {
      //     loggedInUser,
      //     accessToken,
      //     refreshToken
      // }
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      const user = await this.userRepository.logout(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async refershAccessToken(incomingRefreshToken: string) {
    try {
      const { accessToken, refreshToken } = await this.userRepository.refershAccessToken(incomingRefreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data: changePasswordTypes) {
    try {
      await this.userRepository.changePassword(data);
    } catch (error) {
      throw error;
    }
  }

  async changeEmail(data: changeEmailTypes) {
    try {
      const user = await this.userRepository.changeEmail(data);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAccount(userId: string) {
    try {
      return await this.userRepository.deleteUserAccount(userId);
    } catch (error) {
      throw error;
    }
  }

  //----get user by id (by authorized user)

  async getUserById(userId: string) {
    try {
      return await this.userRepository.getUserById(userId);
    } catch (error: any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error while fetching user details.');
    }
  }

  //---- google oauth

  async googleAuth(data : GoogleOAuthProps) {
    try {
      const result =  await this.userRepository.googleAuth(data)
      return result ;
    } catch (error : any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error while fetching user details.');
    }
  }
}

export default UserService;
