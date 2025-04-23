// src/components/ExperienceSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { Experience } from '@/types';
import { api } from '@/services/api';
import { getAuthToken } from '@/lib/auth';
import ReactMarkdown from 'react-markdown';

interface ExperienceSectionProps {
  experiences?: Experience[];
  showAdminControls?: boolean;
  onExperienceUpdate?: (updatedExperiences: Experience[]) => void;
}

export default function ExperienceSection({
  experiences: initialExperiences,
  showAdminControls = false,
  onExperienceUpdate
}: ExperienceSectionProps) {
  // --- State ---
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(!initialExperiences);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For Markdown preview in form
  const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
    title: '', company: '', timeframe: '', description: '', order: 0
  });

  // --- Effects ---
  useEffect(() => {
    const token = getAuthToken();
    setIsAdmin(!!token);
    if (initialExperiences) {
      setExperiences(initialExperiences.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
      return;
    }
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const data = await api.getExperiences();
        setExperiences(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (error) {
        console.error('Error fetching experiences:', error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, [initialExperiences]);

  // Memoized sorted experiences (optional optimization)
  const sortedExperiences = experiences; // Sorting happens on state update now

  // --- Admin Form Functions ---
  const resetForm = () => {
    setFormData({ title: '', company: '', timeframe: '', description: '', order: 0 });
    setIsCreating(false);
    setEditingId(null);
    setShowPreview(false);
  };

  const handleCreateNew = () => {
    resetForm();
    // Set default order to be one higher than the current max, or 1 if empty
    const nextOrder = experiences.length > 0 ? Math.max(...experiences.map(e => e.order ?? 0)) + 1 : 1;
    setFormData(prev => ({ ...prev, order: nextOrder }));
    setIsCreating(true);
  };

  const handleEdit = (experience: Experience) => {
    setIsCreating(false);
    setEditingId(experience._id);
    setFormData({
      title: experience.title,
      company: experience.company,
      timeframe: experience.timeframe,
      description: experience.description,
      order: experience.order || 0
    });
    setShowPreview(false); // Reset preview state when editing starts
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');

      let updatedList: Experience[];
      if (isCreating) {
        const newExperience = await api.createExperience(formData, token);
        updatedList = [...experiences, newExperience];
      } else if (editingId) {
        const updatedExperience = await api.updateExperience(editingId, formData, token);
        updatedList = experiences.map(exp => exp._id === editingId ? updatedExperience : exp);
      } else {
        // Should not happen in normal flow
        console.warn("Submit called without creating or editing state.");
        updatedList = [...experiences];
      }

      const newlySortedList = updatedList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setExperiences(newlySortedList);

      // Notify parent component if callback is provided
      if (onExperienceUpdate) {
        onExperienceUpdate(newlySortedList);
      }
      resetForm(); // Reset form fields and state

    } catch (error) {
      console.error('Error saving experience:', error);
      alert(`Failed to save experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Optional: Add error handling state update
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');

      await api.deleteExperience(id, token);

      const updatedList = experiences.filter(exp => exp._id !== id);
      // No need to re-sort here as deletion doesn't change order of others
      setExperiences(updatedList);

      if (onExperienceUpdate) {
        onExperienceUpdate(updatedList); // Pass the already filtered list
      }

      // If the deleted item was being edited, reset the form
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert(`Failed to delete experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Optional: Refetch or show error state
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

  if (loading) { // Loading Skeleton
    return (
      // Skeleton representing ONE large card
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 h-60"></div>
      </div>
    );
  }

  const shouldShowAdminControls = showAdminControls && isAdmin;

  // No outer <section> needed here, it's handled in page.tsx
  return (
    // This div becomes the SINGLE styled card container for the whole section
    <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-10"> {/* Heading and Add button inside */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Experience
          </h2>
          {shouldShowAdminControls && !isCreating && !editingId && (
            <button onClick={handleCreateNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Add Experience
            </button>
          )}
        </div>

        {/* Admin Form Section (Renders conditionally inside the main card) */}
        {shouldShowAdminControls && (isCreating || editingId) && (
          // Simple container for the form, no extra card styles needed
          <div className="mb-10 p-4 border rounded-md bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5"> {isCreating ? 'Add New Experience' : 'Edit Experience'} </h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label htmlFor="exp-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                    <input id="exp-title" type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" required disabled={isSubmitting} />
                </div>
                 {/* Company */}
                 <div>
                    <label htmlFor="exp-company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                    <input id="exp-company" type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" required disabled={isSubmitting} />
                 </div>
                 {/* Timeframe */}
                 <div>
                    <label htmlFor="exp-timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
                    <input id="exp-timeframe" type="text" value={formData.timeframe} onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" required disabled={isSubmitting} placeholder="e.g., Jan 2020 - Present" />
                 </div>
                {/* Description with Preview */}
                 <div>
                  <label htmlFor="exp-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Description <span className="text-xs text-gray-500">(Supports Markdown)</span> </label>
                  <div className="space-y-2">
                    <div className="flex justify-end"><button type="button" onClick={() => setShowPreview(!showPreview)} className="text-xs text-blue-500 hover:text-blue-700"> {showPreview ? 'Edit' : 'Preview'} </button></div>
                    {showPreview ? (<div className="p-3 border rounded dark:bg-gray-700 dark:border-gray-600 prose dark:prose-invert max-w-none min-h-[8rem]"> <ReactMarkdown>{formData.description}</ReactMarkdown> </div>)
                     : (<textarea id="exp-desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white h-32" required disabled={isSubmitting}></textarea>)}
                  </div>
                </div>
                 {/* Order */}
                 <div>
                  <label htmlFor="exp-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Order <span className="text-xs text-gray-500">(Lower numbers appear first)</span> </label>
                  <input id="exp-order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" required disabled={isSubmitting} />
                 </div>
                {/* Form Buttons */}
                 <div className="flex space-x-4 pt-4">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isSubmitting}> {isSubmitting ? 'Saving...' : 'Save'} </button>
                    <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50" disabled={isSubmitting}> Cancel </button>
                 </div>
             </form>
          </div>
        )}

        {/* Experience List - Items are now direct children (logically) of the main card */}
        <div className="space-y-8"> {/* Vertical spacing between items */}
          {sortedExperiences.length > 0 ? (
            sortedExperiences.map((experience, index) => (
              // SIMPLIFIED ITEM: No card styles, but adds a separator
              <div
                key={experience._id}
                className={index > 0 ? "pt-8 border-t border-gray-200 dark:border-gray-700" : ""} // Add separator except for the first item
              >
                 {/* Card Content Layout */}
                   <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                     <div className="mb-3 sm:mb-0"> {/* Left Side */}
                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{experience.title}</h3>
                       <p className="text-md text-gray-700 dark:text-gray-300 mb-1">{experience.company}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">{experience.timeframe}</p>
                     </div>
                      {shouldShowAdminControls && ( /* Right Side - Admin Buttons */
                         <div className="flex-shrink-0 flex space-x-3 sm:ml-4">
                            <button onClick={() => handleEdit(experience)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium disabled:opacity-50" disabled={isSubmitting || editingId === experience._id} aria-label={`Edit ${experience.title}`}> Edit </button>
                            <button onClick={() => handleDelete(experience._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50" disabled={isSubmitting} aria-label={`Delete ${experience.title}`}> Delete </button>
                         </div>
                       )}
                  </div>
                  {/* Description */}
                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <ReactMarkdown>{experience.description}</ReactMarkdown>
                  </div>
                   {shouldShowAdminControls && ( /* Order indicator */
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Order: {experience.order ?? 0}</p>
                   )}
              </div>
            ))
          ) : (
             // Empty State Message (inside the main card)
            <div className="text-center py-10">
                 <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No professional experience listed yet.</h3>{shouldShowAdminControls && (<p className="mt-2 text-sm text-gray-500 dark:text-gray-400"> Click "Add Experience" above to get started. </p>)}
            </div>
          )}
        </div>
    </div> // End of the single main card div
  );
}