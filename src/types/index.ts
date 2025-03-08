// Type to ensure at least one image source is present
type ImageSource = {
  imageUrl: string;
  imageData?: never;
} | {
  imageUrl?: never;
  imageData: string;
} | {
  imageUrl: string;
  imageData: string;
};

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageData?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  featured?: boolean;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number; // 1-5
  icon?: string;
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
