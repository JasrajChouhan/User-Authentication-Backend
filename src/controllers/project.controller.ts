import { NextFunction, Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import ApiResponse from '../utils/ApiResponse';

const projectService = new ProjectService();

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectName, projectTechStack, description } = req.body;
    const authorId = req.user?._id as string;
    const projectData = { projectName, projectTechStack, description, authorId };
    const project = await projectService.createProject(projectData);

    return res.status(201).json(new ApiResponse(201, project, 'Successfully createing projects.'));
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          {},
          error?.message || 'Error while creating project, Please try again letter.'
        )
      );
  }
};
