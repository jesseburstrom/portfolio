import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageData?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  technologies: {
    type: [String],
    required: [true, 'Technologies are required'],
  },
  imageUrl: {
    type: String,
  },
  imageData: {
    type: String,
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  liveUrl: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
}, {
  timestamps: true,
});

// Ensure that either imageUrl or imageData is provided
ProjectSchema.pre('save', function(next) {
  if (!this.imageUrl && !this.imageData) {
    const err = new Error('Either imageUrl or imageData must be provided');
    return next(err);
  }
  next();
});

export default model<IProject>('Project', ProjectSchema);
