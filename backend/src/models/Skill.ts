import mongoose, { Schema, model, Document } from 'mongoose';
import { ICategory } from './Category'; // Import Category type

export interface ISkill extends Document {
  name: string;
  // Change category to a reference
  category: mongoose.Schema.Types.ObjectId | ICategory; // Reference to Category
}

const SkillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    // Consider making name unique *within* a category later if needed
  },
  // Update category field to store an ObjectId reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Refers to the 'Category' model
    required: [true, 'Category reference is required'],
    index: true // Index for faster lookups involving category
  }
  // Proficiency and Icon removed previously
}, {
  timestamps: true,
  // Ensure unique combination of name and category if desired
  // index: { name: 1, category: 1 }, { unique: true }
});

export default model<ISkill>('Skill', SkillSchema);