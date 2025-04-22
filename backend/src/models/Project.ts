import { Schema, model, Document } from 'mongoose';

// Define a sub-schema for links
const LinkSchema = new Schema({
  name: {
    type: String,
    trim: true,
    // Default name if URL exists but name is not provided
    default: function(this: { url?: string }) {
        // Determine default based on context if possible, or use generic
        return 'Link'; // Basic default
    }
  },
  url: {
    type: String,
    trim: true,
  }
}, { _id: false }); // Don't create separate _id for subdocuments

export interface IProject extends Document {
  title: string;
  description: string;
  technologies: string[];
  images: string[]; // Array to store image URLs or base64 data strings

  // Replace githubUrl and liveUrl with link objects
  link1?: { name: string; url: string };
  link2?: { name: string; url: string };
  date: string;
  featured?: boolean; // Added field from frontend form
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  technologies: {
    type: [String],
    required: [true, 'Technologies are required'],
  },
  images: {
    type: [String], // Array of strings
    validate: [
        (arr: string[]) => arr.length <= 3, // Validator function
        'A project can have a maximum of 3 images.' // Error message
    ],
    required: [true, 'At least one image is required'], // Require at least one image
    default: [] // Default to empty array
  },
  // Use the LinkSchema for link1 and link2
  link1: {
    type: LinkSchema,
    // Provide specific default name if URL is set
    default: () => ({ name: 'Live Demo', url: '' })
  },
  link2: {
    type: LinkSchema,
    // Provide specific default name if URL is set
    default: () => ({ name: 'GitHub', url: '' })
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
  featured: { // Added field
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure that either imageUrl or imageData is provided
ProjectSchema.pre('save', function(next) {
  if (!this.images || this.images.length === 0) {
    const err = new Error('At least one project image must be provided');
    return next(err);
  }
  // Ensure max 3 images (double check, although schema validation should catch it)
  if (this.images.length > 3) {
    const err = new Error('A project cannot have more than 3 images.');
    return next(err);
  }
  
  // Ensure names are set if URLs are present
  if (this.link1?.url && !this.link1.name) {
      this.link1.name = 'Live Demo'; // Default if somehow missed
  }
  if (this.link2?.url && !this.link2.name) {
      this.link2.name = 'GitHub'; // Default if somehow missed
  }
  next();
});

export default model<IProject>('Project', ProjectSchema);