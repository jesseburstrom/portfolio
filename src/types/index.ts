// Define Link type
interface Link {
  name: string;
  url: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageData?: string;
  // Use the Link type
  link1?: Link;
  link2?: Link;
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