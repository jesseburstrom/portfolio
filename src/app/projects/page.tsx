'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types'; // Make sure this imports the updated type
import Image from 'next/image';
import { fileToBase64, validateImage, compressImageToMaxSize } from '@/utils/imageUtils';

// Helper to initialize link state
const initialLinkState = (defaultName: string) => ({ name: defaultName, url: '' });

export default function ProjectsPage() {
  // ... (keep existing state: projects, loading, isAdminUser, etc.)
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updated formData state
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    technologies: [],
    featured: false,
    link1: initialLinkState('Live Demo'), // Initialize with defaults
    link2: initialLinkState('GitHub')    // Initialize with defaults
  });

  // ... (keep useEffect for isAdminUser and fetchProjects)
   useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await api.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


  // Updated resetForm
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: [],
      featured: false,
      link1: initialLinkState('Live Demo'), // Reset with defaults
      link2: initialLinkState('GitHub')    // Reset with defaults
    });
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview('');
    setTechInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Updated handleEdit
  const handleEdit = (project: Project) => {
    setIsCreating(false);
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      featured: project.featured || false,
      // Use existing link data or fall back to defaults
      link1: {
          name: project.link1?.name || 'Live Demo',
          url: project.link1?.url || ''
      },
      link2: {
          name: project.link2?.name || 'GitHub',
          url: project.link2?.url || ''
      }
    });
    setImagePreview(project.imageData || project.imageUrl || '');
    setSelectedImage(null); // Reset selected image when starting edit
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
    }
  };

  // Generic handler for link input changes
  const handleLinkChange = (linkIndex: 'link1' | 'link2', field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
        ...prev,
        [linkIndex]: {
            ...prev[linkIndex], // Keep existing properties
            [field]: value
        }
    }));
  };


  // ... (keep handleCreateNew, handleImageSelect, handleTechKeyPress, removeTech)
    const handleCreateNew = () => {
        setIsCreating(true);
        setEditingId(null);
        resetForm(); // Use the updated resetForm
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (implementation remains the same)
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImage(file);
        if (!validation.valid) {
          alert(validation.message);
          return;
        }

        setSelectedImage(file);
        const base64 = await fileToBase64(file);
        const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
        setImagePreview(compressed);
    };

    const handleTechKeyPress = (e: React.KeyboardEvent) => {
        // ... (implementation remains the same)
        if (e.key === 'Enter' && techInput.trim()) {
          e.preventDefault();
          setFormData(prev => ({
            ...prev,
            technologies: [...(prev.technologies || []), techInput.trim()]
          }));
          setTechInput('');
        }
    };

    const removeTech = (index: number) => {
        // ... (implementation remains the same)
        setFormData(prev => ({
          ...prev,
          technologies: prev.technologies?.filter((_, i) => i !== index) || []
        }));
    };


  // Updated handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      if (!token) {
        alert('You must be logged in to perform this action');
        setIsSubmitting(false); // Added
        return;
      }

      // Ensure link names have defaults if URL is present but name is empty
      const finalFormData = { ...formData };
      if (finalFormData.link1?.url && !finalFormData.link1.name) {
          finalFormData.link1.name = 'Live Demo';
      }
      if (finalFormData.link2?.url && !finalFormData.link2.name) {
          finalFormData.link2.name = 'GitHub';
      }

      // Clear link object if URL is empty (optional, depends on backend strictness)
      // if (!finalFormData.link1?.url) {
      //     finalFormData.link1 = undefined;
      // }
      // if (!finalFormData.link2?.url) {
      //     finalFormData.link2 = undefined;
      // }


      if (isCreating) {
        if (!selectedImage) {
          alert('Please select an image for the project');
          setIsSubmitting(false);
          return;
        }

        const base64 = await fileToBase64(selectedImage);
        const compressed = await compressImageToMaxSize(base64, 300);

        const projectToCreate = {
          ...finalFormData, // Use the potentially adjusted formData
          imageData: compressed,
          imageUrl: undefined, // Ensure only imageData is sent if uploaded
          date: finalFormData.date || new Date().toISOString().split('T')[0] // Ensure date is set
        };

        const newProject = await api.createProject(projectToCreate as Omit<Project, '_id'>, token);
        setProjects(prev => [...prev, newProject]); // Use functional update
      } else if (editingId) {
        const projectToUpdate: Partial<Project> = {
            ...finalFormData, // Use the potentially adjusted formData
        };

        if (selectedImage) {
          const base64 = await fileToBase64(selectedImage);
          const compressed = await compressImageToMaxSize(base64, 300);
          projectToUpdate.imageData = compressed;
          projectToUpdate.imageUrl = undefined; // Clear imageUrl if new image uploaded
        } else {
          // If no new image selected, retain existing image data/url
          // No need to explicitly set imageData/imageUrl here unless clearing one
          // If imagePreview is empty and was cleared, maybe clear image fields?
           if (!imagePreview) {
               projectToUpdate.imageData = undefined;
               projectToUpdate.imageUrl = undefined;
           }
        }

        const updated = await api.updateProject(editingId, projectToUpdate, token);
        setProjects(prev => prev.map(p => p._id === editingId ? updated : p)); // Use functional update
      }

      resetForm();
      // No need to call fetchProjects here if state updates are correct
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep handleDelete)
    const handleDelete = async (id: string) => {
        // ... (implementation remains the same)
        if (!confirm('Are you sure you want to delete this project?')) {
          return;
        }

        try {
          setIsSubmitting(true);
          const token = getAuthToken();

          if (!token) {
            alert('You must be logged in to perform this action');
            setIsSubmitting(false); // Added
            return;
          }

          await api.deleteProject(id, token);
          setProjects(prev => prev.filter(p => p._id !== id)); // Use functional update

          if (editingId === id) {
            resetForm();
          }
        } catch (error) {
          console.error('Error deleting project:', error);
          alert('Failed to delete project');
        } finally {
          setIsSubmitting(false);
        }
    };


  // ... (keep loading check)
   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Start of Render ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header and Add Button */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Here are some of the projects I've worked on
            </p>
          </div>
          {isAdminUser && !isCreating && !editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Project
            </button>
          )}
        </div>

        {/* --- Form Section --- */}
        {isAdminUser && (isCreating || editingId) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isCreating ? 'Add New Project' : 'Edit Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required disabled={isSubmitting}
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  rows={3} required disabled={isSubmitting}
                />
              </div>

              {/* Project Image */}
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Image</label>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        disabled={isSubmitting}
                    >
                        Browse...
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedImage ? selectedImage.name : imagePreview ? 'Current image selected' : 'No image selected'}
                    </span>
                    {imagePreview && (
                         <button
                           type="button"
                           onClick={() => {setImagePreview(''); setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = '';}}
                           className="text-xs text-red-500 hover:text-red-700 ml-2"
                           disabled={isSubmitting}
                         >
                           Remove Image
                         </button>
                     )}
                </div>
                <input
                  type="file" accept="image/*" onChange={handleImageSelect}
                  className="hidden" disabled={isSubmitting} ref={fileInputRef}
                />
                {imagePreview && (
                  <div className="mt-2 relative h-40 w-full border dark:border-gray-600 rounded flex items-center justify-center">
                    <Image
                      src={imagePreview} alt="Project preview" fill
                      className="object-contain p-1" sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                )}
              </div>

              {/* Link 1 */}
              <fieldset className="border dark:border-gray-600 p-4 rounded">
                  <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 1</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                          <input
                              type="text" value={formData.link1?.name || ''}
                              onChange={(e) => handleLinkChange('link1', 'name', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                              placeholder="e.g., Live Demo, App Store" disabled={isSubmitting}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                          <input
                              type="url" value={formData.link1?.url || ''}
                              onChange={(e) => handleLinkChange('link1', 'url', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                              placeholder="https://example.com" disabled={isSubmitting}
                          />
                      </div>
                  </div>
              </fieldset>

              {/* Link 2 */}
              <fieldset className="border dark:border-gray-600 p-4 rounded">
                   <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 2</legend>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                          <input
                              type="text" value={formData.link2?.name || ''}
                              onChange={(e) => handleLinkChange('link2', 'name', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                              placeholder="e.g., GitHub, Source Code" disabled={isSubmitting}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                          <input
                              type="url" value={formData.link2?.url || ''}
                              onChange={(e) => handleLinkChange('link2', 'url', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                              placeholder="https://github.com/user/repo" disabled={isSubmitting}
                          />
                      </div>
                  </div>
              </fieldset>

              {/* Technologies */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Technologies (press Enter after each)
                 </label>
                 {/* ... (input and display logic remains the same) ... */}
                 <input
                  type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyPress}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="React, Next.js, etc." disabled={isSubmitting}
                 />
                 <div className="flex flex-wrap gap-2 mt-2">
                   {formData.technologies?.map((tech, index) => (
                     <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                       {tech}
                       <button type="button" onClick={() => removeTech(index)} className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                         ×
                       </button>
                     </span>
                   ))}
                 </div>
              </div>
              {/* Featured */}
              <div className="flex items-center">
                 {/* ... (checkbox logic remains the same) ... */}
                 <input
                    type="checkbox" id="featured" checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded" disabled={isSubmitting}
                 />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Project
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
                <button
                  type="button" onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Project List Section --- */}
        {projects.length === 0 && !isCreating ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
             {isAdminUser && ( /* Show add button only if admin and no form is open */
                 <button
                     onClick={handleCreateNew}
                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
                 >
                     Add Your First Project
                 </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
               // --- Reuse ProjectCard component ---
               <div key={project._id} className="relative group">
                    <ProjectCard project={project} />
                    {/* Admin Controls Overlay */}
                    {isAdminUser && (
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => handleEdit(project)}
                                className="p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Edit project"
                                disabled={isSubmitting}
                            >
                                {/* Simple Edit Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(project._id)}
                                className="p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                aria-label="Delete project"
                                disabled={isSubmitting}
                            >
                                {/* Simple Delete Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
              // --- End ProjectCard reuse ---
            ))}
          </div>
        )}
      </div>
    </div>
  );
}