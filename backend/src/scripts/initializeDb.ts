import { connectDB } from '../config/database';
import Project from '../models/Project';
import About from '../models/About';
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

    // Initialize About if empty
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      const sampleAbout = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'A passionate developer with experience in web development',
        location: 'Your Location',
        email: 'your.email@example.com',
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          twitter: 'https://twitter.com/yourusername'
        }
      };

      await About.create(sampleAbout);
      console.log('About information created');
    } else {
      console.log('About collection already initialized');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDb();
