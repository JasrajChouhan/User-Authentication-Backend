import { NextFunction, Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json(new ApiResponse(200, {}, 'project'));
};
