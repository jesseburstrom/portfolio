import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load existing .env if it exists
dotenv.config();

const envPath = path.join(__dirname, '../../.env');

const envContent = `PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-super-secret-key-change-this
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('Successfully created/updated .env file');
  
  // Reload environment variables
  dotenv.config();
  
  console.log('Environment variables set:');
  console.log('PORT:', process.env.PORT);
  console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
} catch (error) {
  console.error('Error creating .env file:', error);
}
