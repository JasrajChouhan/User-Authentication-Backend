import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { log } from 'console';
import serverConfigVariable from '../config/serverConfig';

export class DockerService {
  async createDockerContainer(projectTechStack: string, projectName: string) {
    try {
      const availablePort = await this.findAvailablePort();
      console.log(`Selected port for container: ${availablePort}`);

      // Create Docker container with the assigned port
      await this.createAndRunContainer(projectTechStack, projectName, availablePort);
    } catch (error: any) {
      throw new Error('Error in Docker service: ' + error.message);
    }
  }

  private async createAndRunContainer(projectTechStack: string, projectName: string, port: number) {
    try {
      // Define Dockerfile content based on the tech stack
      const dockerfileContent = this.getDockerfileContent(projectTechStack);
      console.log(`Generated Dockerfile content:\n${dockerfileContent}`);

      // Temporary directory to store Dockerfile
      const tempDir = path.join(__dirname, 'temp', projectName);
      const dockerfilePath = path.join(tempDir, 'Dockerfile');

      console.log(`Creating Dockerfile in: ${dockerfilePath}`);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.writeFileSync(dockerfilePath, dockerfileContent);

      // Build Docker image
      const imageName = `${projectName.toLowerCase()}-image`;
      const buildCommand = `docker build -t ${imageName} ${tempDir}`;

      console.log(`Building Docker image with command: ${buildCommand}`);
      await this.runCommand(buildCommand);
      console.log(`Docker image '${imageName}' built successfully.`);

      // Run Docker container
      const containerName = `${projectName.toLowerCase()}-${Date.now()}`;
      const runCommand = `docker run -d -p ${port}:3000 --name ${containerName} ${imageName}`;

      console.log(`Running Docker container with command: ${runCommand}`);
      await this.runCommand(runCommand);

      console.log(`Docker container '${containerName}' is running on port ${port}.`);
    } catch (error: any) {
      throw new Error('Error while creating and running Docker container: ' + error.message);
    }
  }

  private getDockerfileContent(projectTechStack: string): string {
    if (projectTechStack === 'nodejs') {
      return `
        FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Create the application code dynamically
RUN echo 'const express = require("express");' > index.js && \
    echo 'const app = express();' >> index.js && \
    echo 'app.get("/", (req, res) => res.json({ message: "Hello, World!" }));' >> index.js && \
    echo 'const PORT = process.env.PORT || 3000;' >> index.js && \
    echo 'app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));' >> index.js

# Install dependencies
RUN npm init -y && npm install express

# Expose the port
EXPOSE 3000

# Run the application
CMD ["node", "index.js"]
`;
    } else if (projectTechStack === 'reactjs') {
      return `
        FROM node:14
        WORKDIR /usr/src/app
        RUN npx create-react-app .
        EXPOSE 3000
        CMD ["npm", "start"]
        `;
    } else {
      throw new Error('Unsupported tech stack');
    }
  }

  private async findAvailablePort(): Promise<number> {
    const preferredPort = Number(serverConfigVariable.PORT) || 3001;
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
      const port = preferredPort + i;
      const isFree = await this.isPortFree(port);
      if (isFree) return port;
    }

    throw new Error('No available port found after 10 attempts.');
  }

  private async isPortFree(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const server = require('net').createServer();
      server
        .once('error', () => resolve(false))
        .once('listening', () => {
          server.close();
          resolve(true);
        })
        .listen(port);
    });
  }

  private runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          log(`Command failed: ${stderr}`);
          reject(new Error(stderr.trim()));
        } else {
          log(`Command output: ${stdout}`);
          resolve();
        }
      });
    });
  }
}
