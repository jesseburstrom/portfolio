import { Request, Response } from 'express';
import Experience from '../models/Experience';
import { adminAuth, AuthRequest } from '../middleware/authMiddleware';

// Get all experiences
export const getExperiences = async (req: Request, res: Response): Promise<void> => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ message: 'Failed to fetch experiences' });
  }
};

// Get a single experience by ID
export const getExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ message: 'Failed to fetch experience' });
  }
};

// Create a new experience (admin only)
export const createExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    const { title, company, timeframe, description, order } = req.body;
    
    const experience = new Experience({
      title,
      company,
      timeframe,
      description,
      order: order || 0,
    });
    
    const savedExperience = await experience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ message: 'Failed to create experience' });
  }
};

// Update an experience (admin only)
export const updateExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;
    
    const experience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Failed to update experience' });
  }
};

// Delete an experience (admin only)
export const deleteExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }
    
    const { id } = req.params;
    const deletedExperience = await Experience.findByIdAndDelete(id);
    
    if (!deletedExperience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Failed to delete experience' });
  }
};
