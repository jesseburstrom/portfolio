import mongoose from 'mongoose';
import AboutMe from '../models/AboutMe';
import dotenv from 'dotenv';

dotenv.config();

const initializeDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio');
    console.log('Connected to MongoDB');

    // Check if about data exists
    const existingAbout = await AboutMe.findOne();
    if (!existingAbout) {
      // Create initial about data
      const aboutData = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'A passionate developer with experience in modern web technologies',
        location: 'Your Location',
        email: 'your.email@example.com',
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          twitter: 'https://twitter.com/yourusername'
        }
      };

      const about = await AboutMe.create(aboutData);
      console.log('Created initial about data:', about);
    } else {
      console.log('About data already exists:', existingAbout);
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

initializeDb();
