import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'node:util';
import child_process from 'node:child_process';
import { v4 as uuidv4 } from 'uuid';

import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exec = promisify(child_process.exec);

    // Navigate to the /projects directory (Ensure it exists)
    const projectsDir = path.join(__dirname, '..', '..', 'projects');
    await fs.mkdir(projectsDir, { recursive: true });

    // Create a folder with a unique name
    const folderName = uuidv4();
    const projectPath = path.join(projectsDir, folderName);
    await fs.mkdir(projectPath);

    // Run Vite command to initialize a new project
    const command = `cd ${projectPath} && npm create vite@latest codesandbox -- --template react`;

    const { stdout, stderr } = await exec(command);

    if (stderr) {
      throw new ApiError(500, `Error setting up Vite project: ${stderr}`);
    }

    return res.status(200).json(new ApiResponse(200, { folderName, stdout }, 'Project created successfully.'));
  } catch (error: any) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message || 'Internal Server Error'));
  }
};
