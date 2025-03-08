'use client';

import { useEffect, useState } from 'react';
import { Experience } from '@/types';
import { api } from '@/services/api';
import { getAuthToken } from '@/lib/auth';
import { usePathname } from 'next/navigation';

interface ExperienceSectionProps {
  experiences?: Experience[];
  showAdminControls?: boolean;
}

export default function ExperienceSection({ 
  experiences: initialExperiences,
  showAdminControls = false
}: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences || []);
  const [loading, setLoading] = useState(!initialExperiences);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  
  const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
    title: '',
    company: '',
    timeframe: '',
    description: '',
    order: 0
  });

  useEffect(() => {
    // Check if user is admin
    const token = getAuthToken();
    setIsAdmin(!!token);
    
    if (initialExperiences) {
      setExperiences(initialExperiences);
      setLoading(false);
      return;
    }
    
    const fetchExperiences = async () => {
      try {
        const data = await api.getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [initialExperiences]);

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: 0
    });
    setIsCreating(false);
    setEditingId(null);
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: experiences.length + 1
    });
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
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        const newExperience = await api.createExperience(formData, token);
        setExperiences([...experiences, newExperience]);
      } else if (editingId) {
        const updatedExperience = await api.updateExperience(editingId, formData, token);
        setExperiences(experiences.map(exp => exp._id === editingId ? updatedExperience : exp));
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      await api.deleteExperience(id, token);
      setExperiences(experiences.filter(exp => exp._id !== id));
      
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show admin controls if explicitly enabled and user is admin
  const shouldShowAdminControls = showAdminControls && isAdmin;

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Experience
          </h2>
          
          {shouldShowAdminControls && !isCreating && !editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Experience
            </button>
          )}
        </div>
        
        {/* Experience Form for Admin */}
        {shouldShowAdminControls && (isCreating || editingId) && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isCreating ? 'Add New Experience' : 'Edit Experience'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., Jan 2020 - Present"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white h-32"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Experience Timeline */}
        <div className="space-y-12">
          {experiences
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((experience) => (
              <div key={experience._id} className="relative">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {experience.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {experience.company}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {experience.timeframe}
                    </p>
                    
                    {shouldShowAdminControls && (
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => handleEdit(experience)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(experience._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{experience.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
