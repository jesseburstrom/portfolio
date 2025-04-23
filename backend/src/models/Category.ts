import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  key: string; // A unique, stable key (e.g., 'programming', 'dev-tools') - Not easily changed
  displayName: string; // The name shown in the UI (e.g., "Programming", "Development Tools") - Editable
  order?: number; // Optional: For controlling display order
}

const CategorySchema = new Schema<ICategory>({
  key: {
    type: String,
    required: [true, 'Category key is required'],
    trim: true,
    unique: true,
    lowercase: true,
    // Example validation: simple slug-like keys
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Key must be lowercase alphanumeric with hyphens only']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
  },
  order: {
     type: Number,
     default: 0
  }
}, {
  timestamps: true,
});

export default model<ICategory>('Category', CategorySchema);