import { connectDB } from '../config/database';
import Project from '../models/Project';
import AboutMe from '../models/AboutMe';
import Experience from '../models/Experience';
import { config } from 'dotenv';

// Load environment variables
config();

const initializeDb = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Initialize Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const sampleProject = {
        title: 'Portfolio Website',
        description: 'A personal portfolio website built with Next.js and Express',
        technologies: ['Next.js', 'Express', 'TypeScript', 'MongoDB'],
        imageUrl: 'https://via.placeholder.com/800x600',
        githubUrl: 'https://github.com/yourusername/portfolio',
        liveUrl: 'https://your-portfolio.com',
        date: '2025-03',
      };

      await Project.create(sampleProject);
      console.log('Sample project created');
    } else {
      console.log('Projects collection already initialized');
    }

    // Initialize Experiences if empty
    const experienceCount = await Experience.countDocuments();
    if (experienceCount === 0) {
      const sampleExperiences = [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Innovations Inc.',
          timeframe: 'January 2022 - Present',
          description: 'Leading the development of cloud-based solutions using React, Node.js, and AWS. Mentoring junior developers and implementing CI/CD pipelines.',
          order: 1
        },
        {
          title: 'Full Stack Developer',
          company: 'Digital Solutions Ltd.',
          timeframe: 'March 2019 - December 2021',
          description: 'Developed and maintained web applications using the MERN stack. Collaborated with design and product teams to deliver high-quality software solutions.',
          order: 2
        },
        {
          title: 'Frontend Developer',
          company: 'Creative Web Agency',
          timeframe: 'June 2017 - February 2019',
          description: 'Created responsive and interactive user interfaces using React and CSS frameworks. Worked closely with UX designers to implement pixel-perfect designs.',
          order: 3
        }
      ];

      await Experience.insertMany(sampleExperiences);
      console.log('Sample experiences created');
    } else {
      console.log('Experiences collection already initialized');
    }

    // Initialize AboutMe if empty
    const aboutCount = await AboutMe.countDocuments();
    if (aboutCount === 0) {
      const sampleAbout = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'A passionate developer with experience in web development',
        location: 'Your Location',
        phone: '+1 (123) 456-7890',
        email: 'your.email@example.com',
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          twitter: 'https://twitter.com/yourusername'
        }
      };

      await AboutMe.create(sampleAbout);
      console.log('About information created');
    } else {
      console.log('AboutMe collection already initialized');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDb();
