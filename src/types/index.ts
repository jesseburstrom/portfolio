// Define Link type
interface Link {
  name: string;
  url: string;
}

export interface Project {
  _id: string;
  title: string;
  thumbnailDescription?: string;
  description: string;
  technologies: string[];
  // Replace single image fields with an array
  images: string[]; // Array of image URLs or base64 data strings
  // Use the Link type
  link1?: Link;
  link2?: Link;
  date: string;
  featured?: boolean;
}

export interface Category {
  _id: string;
  key: string;
  displayName: string;
  order?: number;
  // Add createdAt/updatedAt if needed from backend
}

export interface Skill {
  _id: string;
  name: string;
  category: Category; // Changed from enum
  // proficiency?: number; // Removed
  // icon?: string; // Removed (optional)
}

export interface AboutMe {
  _id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  phone?: string;
  email: string;
  imageUrl?: string;
  imageData?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Experience {
  _id: string;
  title: string;
  company: string;
  timeframe: string;
  description: string;
  order?: number;
}