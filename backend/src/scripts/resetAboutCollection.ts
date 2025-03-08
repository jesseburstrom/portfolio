import { connectDB } from '../config/database';
import AboutMe from '../models/AboutMe';
import { config } from 'dotenv';

// Load environment variables
config();

async function resetAboutCollection() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB...');

    // Drop the AboutMe collection
    await AboutMe.collection.drop();
    console.log('AboutMe collection dropped successfully');

    // Initialize AboutMe with new schema including phone field
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
    console.log('AboutMe collection reinitialized with phone field');

  } catch (error) {
    console.error('Error resetting AboutMe collection:', error);
  } finally {
    process.exit();
  }
}

resetAboutCollection();
