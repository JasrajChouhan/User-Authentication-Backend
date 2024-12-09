import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  projectTechStack: 'reactjs' | 'nodejs' | 'rust' | 'reactts';
  author: mongoose.Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, 'Please provide a project name.'],
      minlength: [3, 'Project name must be at least 3 characters long.'],
      maxlength: [40, 'Project name can be at most 40 characters long.'],
      unique: true,
      index: true,
    },
    projectTechStack: {
      type: String,
      enum: ['reactjs', 'nodejs', 'rust', 'reactts'],
      required: [true, 'Please specify the tech stack for the project.'],
      lowercase : true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must have an author.'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters long.'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
