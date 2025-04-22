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
  imageUrl?: string;
  imageData?: string;
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
  imageUrl: {
    type: String,
  },
  imageData: {
    type: String,
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
  if (!this.imageUrl && !this.imageData) {
    const err = new Error('Either imageUrl or imageData must be provided');
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