import { Schema, model, Document } from 'mongoose';

export interface IAbout extends Document {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const AboutSchema = new Schema<IAbout>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
  },
}, {
  timestamps: true,
});

export default model<IAbout>('About', AboutSchema);
