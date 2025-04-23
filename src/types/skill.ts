export interface Skill {
  _id: string;
  name: string;
  category: string; // Changed from enum
  // proficiency?: number; // Removed
  // icon?: string; // Removed (optional)
}