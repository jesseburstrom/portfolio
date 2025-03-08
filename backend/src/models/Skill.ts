import { Schema, model, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number;
  icon?: string;
}

const SkillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['frontend', 'backend', 'tools', 'other'],
  },
  proficiency: {
    type: Number,
    required: [true, 'Proficiency is required'],
    min: [1, 'Proficiency must be between 1 and 5'],
    max: [5, 'Proficiency must be between 1 and 5'],
  },
  icon: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default model<ISkill>('Skill', SkillSchema);
