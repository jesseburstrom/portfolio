import { Schema, model, Document } from 'mongoose';

export interface IAboutMe extends Document {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  imageUrl?: string;
  imageData?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const AboutMeSchema = new Schema<IAboutMe>({
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
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  imageUrl: {
    type: String,
  },
  imageData: {
    type: String,
  },
  socialLinks: {
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
});

export default model<IAboutMe>('AboutMe', AboutMeSchema);
