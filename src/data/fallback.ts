import { AboutMe, Project, Skill, Experience } from '../types';

export const fallbackProjects: Project[] = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with Next.js, Node.js, and MongoDB',
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    // Use the images array
    images: [
        'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&h=600&crop=entropy',
        'https://via.placeholder.com/800x600/0000FF/808080?text=Screenshot+2',
        'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Screenshot+3'
    ],
    link1: { name: 'Live Demo', url: 'https://ecommerce-demo.com' },
    link2: { name: 'GitHub Repo', url: 'https://github.com/username/ecommerce' },
    date: '2024-12',
    featured: true
  },
  {
    _id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates',
    technologies: ['React', 'Express', 'Socket.io', 'PostgreSQL'],
    // Use the images array
    images: [
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&h=600&crop=entropy'
    ],
    link1: { name: 'Try It Live', url: '' },
    link2: { name: 'Source Code', url: 'https://github.com/username/taskmanager' },
    date: '2024-09',
    featured: false
  },
];

export const fallbackSkills: Skill[] = [];
export const fallbackExperiences: Experience[] = [
  {
    _id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Innovations Inc.',
    timeframe: 'January 2022 - Present',
    description: 'Leading the development of cloud-based solutions using React, Node.js, and AWS. Mentoring junior developers and implementing CI/CD pipelines.',
    order: 1
  },
  {
    _id: '2',
    title: 'Full Stack Developer',
    company: 'Digital Solutions Ltd.',
    timeframe: 'March 2019 - December 2021',
    description: 'Developed and maintained web applications using the MERN stack. Collaborated with design and product teams to deliver high-quality software solutions.',
    order: 2
  },
  {
    _id: '3',
    title: 'Frontend Developer',
    company: 'Creative Web Agency',
    timeframe: 'June 2017 - February 2019',
    description: 'Created responsive and interactive user interfaces using React and CSS frameworks. Worked closely with UX designers to implement pixel-perfect designs.',
    order: 3
  }
];

export const fallbackAboutMe: AboutMe = {
  _id: '1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Passionate full-stack developer with 5 years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
  location: 'Stockholm, Sweden',
  phone: '+1 (123) 456-7890',
  email: 'contact@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400',
  socialLinks: {
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    twitter: 'https://twitter.com/username',
  },
};
