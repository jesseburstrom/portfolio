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

export const fallbackSkills: Skill[] = [
  // Programming
  { _id: 's1', name: 'Python', category: 'programming' },
  { _id: 's2', name: '.NET', category: 'programming' },
  { _id: 's3', name: 'Flutter', category: 'programming' },
  { _id: 's4', name: 'HTML', category: 'programming' },
  { _id: 's5', name: 'CSS', category: 'programming' },
  { _id: 's6', name: 'JavaScript', category: 'programming' },
  { _id: 's7', name: 'TypeScript', category: 'programming' },
  { _id: 's8', name: 'React', category: 'programming' },
  { _id: 's9', name: 'Java', category: 'programming' },

  // Development Tools
  { _id: 's10', name: 'Visual Studio', category: 'development tools' },
  { _id: 's11', name: 'VS Code', category: 'development tools' },
  { _id: 's12', name: 'Android Studio', category: 'development tools' },

  // Database
  { _id: 's13', name: 'SQL Server', category: 'database' },
  { _id: 's14', name: 'MySQL', category: 'database' },
  { _id: 's15', name: 'MongoDB', category: 'database' },

  // Tools & Platforms
  { _id: 's16', name: 'Azure DevOps', category: 'tools & platforms' },
  { _id: 's17', name: 'GitHub', category: 'tools & platforms' },
  { _id: 's18', name: 'GitLab', category: 'tools & platforms' },
  { _id: 's19', name: 'AWS', category: 'tools & platforms' },
  { _id: 's20', name: 'GCP', category: 'tools & platforms' },

   // Development Methodologies
  { _id: 's21', name: 'Full-stack Development', category: 'development methodologies' },
  { _id: 's22', name: 'Agile', category: 'development methodologies' },
  { _id: 's23', name: 'CI/CD', category: 'development methodologies' },
  { _id: 's24', name: 'Jira', category: 'development methodologies' },

   // Operating Systems
  { _id: 's25', name: 'Windows', category: 'operating systems' },
  { _id: 's26', name: 'Linux', category: 'operating systems' },
  { _id: 's27', name: 'Mac', category: 'operating systems' },
  { _id: 's28', name: 'Android', category: 'operating systems' },
  { _id: 's29', name: 'iOS', category: 'operating systems' },
];

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
