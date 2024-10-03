import { IUser } from '../models/user.model';

export interface userTypes {
  email: string;
  password: string;
  username: string;
}

export interface changePasswordTypes {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confiromPassword: string;
}

export interface changeEmailTypes {
  oldEmail: string;
  newEmail: string;
}

export interface LoginResponse  {
  loggedInUser: IUser | null;
  accessToken: string;
  refreshToken: string;
}

export interface ICookieOptions {
  httpOnly: boolean;
  secure?: boolean;
  sameSite: 'lax' | 'strict' | undefined | 'none';
  expires: Date;
  maxAge: number;
}
