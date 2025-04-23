// src/components/AdminSkillsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Skill, Category } from '@/types/index'; // Use index type
import { api } from '@/services/api'; // Import the api service

interface AdminSkillsManagerProps {
  skills: Skill[];
  onUpdate: () => void;
  categories: Category[]; // Prop definition is correct
}

export default function AdminSkillsManager({ skills, onUpdate, categories }: AdminSkillsManagerProps) {
  // --- State Variables ---
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({ name: '' }); // Only name needed initially
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // State for dropdown selection
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [skillError, setSkillError] = useState<string | null>(null); // Optional error state

  // --- useEffect to set initial category based on props ---
  useEffect(() => {
    // Set initial dropdown value only if categories loaded and no category selected
    if (!selectedCategoryId && Array.isArray(categories) && categories.length > 0) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories]); // Dependency: categories prop
  // --- End useEffect ---

  // --- Reset Function ---
  const resetForm = () => {
    setEditingSkill(null);
    setNewSkill({ name: '' });
    setSelectedCategoryId(categories.length > 0 ? categories[0]._id : ''); // Reset dropdown
    setIsSubmitting(false);
    // setSkillError(null); // Reset error if using
  };
  // --- End Reset Function ---

  // --- Handlers ---
  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill); // Set the full skill object being edited
    // Set the dropdown based on the skill's category ID
    setSelectedCategoryId(skill.category?._id || '');
    setNewSkill({ name: skill.name }); // Pre-fill name in case needed (though edit form uses editingSkill.name)
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    setIsSubmitting(true);
    // setSkillError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      await api.deleteSkill(id, token); // Use api service
      if (editingSkill?._id === id) {
        resetForm(); // Reset if deleting the item being edited
      }
      await onUpdate(); // Refresh parent list
    } catch (error) {
      console.error('Error deleting skill:', error);
      // setSkillError(`Failed to delete skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
      alert(`Failed to delete skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name?.trim() || !selectedCategoryId) { // Validate name from editingSkill and selected category
      // setSkillError("Skill Name and Category are required.");
      alert("Skill Name and Category are required.");
      return;
    }
    setIsSubmitting(true);
    // setSkillError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      // Data to send: ONLY the fields that can be updated (name, category ID)
      const dataToUpdate = {
        name: editingSkill.name.trim(),
        category: selectedCategoryId,
      };
      await api.updateSkill(editingSkill._id, dataToUpdate, token); // Use api service
      resetForm();
      await onUpdate();
    } catch (error) {
      console.error('Error updating skill:', error);
      // setSkillError(`Failed to update skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
      alert(`Failed to update skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name?.trim() || !selectedCategoryId) { // Validate name from newSkill and selected category
      // setSkillError("Skill Name and Category are required.");
      alert("Skill Name and Category are required.");
      return;
    }
    setIsSubmitting(true);
    // setSkillError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      // Data to send: name and category ID
      const dataToCreate = {
        name: newSkill.name.trim(),
        category: selectedCategoryId,
      };
      await api.createSkill(dataToCreate, token); // Use api service
      resetForm();
      await onUpdate();
    } catch (error) {
      console.error('Error creating skill:', error);
      // setSkillError(`Failed to create skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
      alert(`Failed to create skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- End Handlers ---


  // --- JSX Return ---
  return (
    <div className="space-y-8">
      {/* Add New Skill Form - Show only if not editing */}
      {!editingSkill && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Skill</h3>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Name </label>
              <input
                type="text"
                value={newSkill.name || ''}
                onChange={(e) => setNewSkill({ name: e.target.value })} // Only update name here
                placeholder="Skill name"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Category </label>
              <select
                  value={selectedCategoryId} // Use dedicated state
                  onChange={(e) => setSelectedCategoryId(e.target.value)} // Update dedicated state
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting || categories.length === 0}
              >
                  <option value="" disabled>-- Select Category --</option>
                  {/* Map over categories prop */}
                  {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                          {cat.displayName}
                      </option>
                  ))}
              </select>
              {categories.length === 0 && (<p className="text-xs text-red-500 mt-1">No categories available.</p>)}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600' } text-white py-2 px-4 rounded transition-colors`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Skill'}
            </button>
          </form>
        </div>
      )}

      {/* Edit Skill Form - Show only if editingSkill is set */}
      {editingSkill && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Skill</h3>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Name </label>
                    <input
                        type="text"
                        value={editingSkill.name} // Read from editingSkill
                        // Update the editingSkill state directly
                        onChange={(e) => setEditingSkill(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                {/* Category Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Category </label>
                    <select
                        value={selectedCategoryId} // Use dedicated state
                        onChange={(e) => setSelectedCategoryId(e.target.value)} // Update dedicated state
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        required
                        disabled={isSubmitting || categories.length === 0}
                    >
                        <option value="" disabled>-- Select Category --</option>
                        {/* Map over categories prop */}
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.displayName}
                            </option>
                        ))}
                    </select>
                    {categories.length === 0 && (<p className="text-xs text-red-500 mt-1">No categories available.</p>)}
                </div>
                {/* Buttons */}
                <div className="flex space-x-2 pt-2">
                    <button type="submit" className={`flex-1 ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600' } text-white py-2 px-4 rounded transition-colors`} disabled={isSubmitting} > {isSubmitting ? 'Saving...' : 'Save'} </button>
                    <button type="button" onClick={resetForm} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors" disabled={isSubmitting} > Cancel </button>
                </div>
            </form>
        </div>
      )}

      {/* Existing Skills List */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8">Current Skills</h3>
         {skills.length === 0 ? (
             <p className="text-gray-600 dark:text-gray-400">No skills added yet.</p>
         ) : (
            skills.map((skill) => (
                <div key={skill._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                        {/* Display category display name */}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {skill.category?.displayName || 'N/A'}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleEdit(skill)} className={`px-3 py-1 text-white rounded transition-colors text-sm ${ isSubmitting || editingSkill?._id === skill._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600' }`} disabled={isSubmitting || editingSkill?._id === skill._id} > Edit </button>
                        <button onClick={() => handleDelete(skill._id)} className={`px-3 py-1 text-white rounded transition-colors text-sm ${ isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600' }`} disabled={isSubmitting} > Delete </button>
                    </div>
                    </div>
                </div>
             ))
         )}
      </div>
    </div>
  );
}