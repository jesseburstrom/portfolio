import { AboutMe, Project, Skill } from '../types';

export const fallbackProjects: Project[] = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with Next.js, Node.js, and MongoDB',
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&h=600',
    githubUrl: 'https://github.com/username/ecommerce',
    liveUrl: 'https://ecommerce-demo.com',
    date: '2024-12',
    featured: true
  },
  {
    _id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates',
    technologies: ['React', 'Express', 'Socket.io', 'PostgreSQL'],
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&h=600',
    githubUrl: 'https://github.com/username/taskmanager',
    date: '2024-09',
    featured: false
  },
];

export const fallbackSkills: Skill[] = [
  {
    _id: '1',
    name: 'React',
    category: 'frontend',
    proficiency: 5,
    icon: 'react',
  },
  {
    _id: '2',
    name: 'Node.js',
    category: 'backend',
    proficiency: 4,
    icon: 'nodejs',
  },
  {
    _id: '3',
    name: 'MongoDB',
    category: 'backend',
    proficiency: 4,
    icon: 'mongodb',
  },
  {
    _id: '4',
    name: 'TypeScript',
    category: 'frontend',
    proficiency: 5,
    icon: 'typescript',
  },
];

export const fallbackAboutMe: AboutMe = {
  _id: '1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Passionate full-stack developer with 5 years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
  location: 'Stockholm, Sweden',
  email: 'contact@example.com',
  socialLinks: {
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    twitter: 'https://twitter.com/username',
  },
};
