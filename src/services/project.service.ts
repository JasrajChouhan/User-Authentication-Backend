import { ProjectRepository } from '../repository/project.repository';
import { DockerService } from '../services/docker.service';
import ApiError from '../utils/ApiError';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private dockerService: DockerService;

  constructor() {
    this.dockerService = new DockerService();
    this.projectRepository = new ProjectRepository();
  }

  async createProject(data: { projectName: string; projectTechStack: string; description: string; authorId: string }) {
    try {
      const project = await this.projectRepository.projectCreate(data);
      await this.dockerService.createDockerContainer(data.projectTechStack, data.projectName);
      return project;
    } catch (error: any) {
      throw new ApiError(error.statusCode || 500, error.message || 'Error while creating project.');
    }
  }
}
