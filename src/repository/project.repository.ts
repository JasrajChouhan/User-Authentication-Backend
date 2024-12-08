import mongoose, { ObjectId } from 'mongoose';
import Project, { IProject } from '../models/project.model';
import User from '../models/user.model';
import ApiError from '../utils/ApiError';

export class ProjectRepository {
  async projectCreate(projectData: {
    projectName: string;
    projectTechStack: string;
    description: string;
    authorId: string;
  }) {
    const { projectName, projectTechStack, description, authorId } = projectData;

    try {
      if ([projectName, projectTechStack, authorId].some(value => value === '')) {
        throw new ApiError(400, 'Please fill all the fields.');
      }

      const existingProject = await Project.findOne({ projectName });
      if (existingProject) {
        throw new ApiError(400, 'Project name already exists.');
      }

      const user = await User.findById(authorId);
      if (!user) {
        throw new ApiError(404, 'User not found.');
      }

      const userProjectsCount = await Project.countDocuments({ author: authorId });
      if (userProjectsCount >= 2) {
        throw new ApiError(400, 'You cannot create more than 2 projects.');
      }

      const newProject = new Project({
        projectName,
        projectTechStack,
        description,
        author: authorId,
      });

      // Save the new project to the database
      await newProject.save();
      user.projects.push(newProject._id as mongoose.Types.ObjectId);
      await user.save({
        validateBeforeSave: false,
      });

      return newProject;
    } catch (error: any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error while creating project.');
    }
  }
}
