'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types';
import Image from 'next/image';
import { fileToBase64, validateImage, compressImageToMaxSize } from '@/utils/imageUtils';

const MAX_IMAGES = 3;

// Helper to initialize link state (keep as is)
const initialLinkState = (defaultName: string) => ({ name: defaultName, url: '' });

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for multiple files and previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Stores base64 previews for NEW files
  const [existingImages, setExistingImages] = useState<string[]>([]); // Stores URLs/base64 from the project being edited

  // Updated formData state to use 'images' array
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    technologies: [],
    featured: false,
    images: [], // Initialize as empty array
    link1: initialLinkState('Live Demo'),
    link2: initialLinkState('GitHub')
  });

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

  // Reset form, including multi-image state
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: [],
      featured: false,
      images: [], // Reset images
      link1: initialLinkState('Live Demo'),
      link2: initialLinkState('GitHub')
    });
    setIsCreating(false);
    setEditingId(null);
    setSelectedFiles([]); // Clear selected files
    setImagePreviews([]); // Clear new previews
    setExistingImages([]); // Clear existing image previews
    setTechInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Set up form for editing, populating image states
  const handleEdit = (project: Project) => {
    setIsCreating(false);
    setEditingId(project._id);
    setFormData({ // Populate form data
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      featured: project.featured || false,
      images: project.images || [], // Set images from project
      link1: { name: project.link1?.name || 'Live Demo', url: project.link1?.url || '' },
      link2: { name: project.link2?.name || 'GitHub', url: project.link2?.url || '' }
    });
    setExistingImages(project.images || []); // Populate existing images for preview
    setSelectedFiles([]); // Clear any lingering new file selections
    setImagePreviews([]); // Clear new file previews
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  const handleLinkChange = (linkIndex: 'link1' | 'link2', field: 'name' | 'url', value: string) => {
     setFormData(prev => ({
        ...prev,
        [linkIndex]: { ...(prev[linkIndex] || {}), [field]: value }
     }));
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    // Clear specific form data fields for a new entry
    setFormData({
        title: '',
        description: '',
        technologies: [],
        featured: false,
        images: [], // Clear images specifically
        link1: { name: 'Live Demo', url: '' }, // Reset links
        link2: { name: 'GitHub', url: '' }
    });
    setSelectedFiles([]); // Clear file selections
    setImagePreviews([]); // Clear previews
    setExistingImages([]); // Clear any potential leftover existing images
    setTechInput(''); // Clear tech input
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input visually
    }
  };

  // Handle selection of multiple files
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentTotalImages = existingImages.length + selectedFiles.length;
    const allowedNewFiles = MAX_IMAGES - currentTotalImages;

    if (allowedNewFiles <= 0) {
        alert(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(files.length, allowedNewFiles); i++) {
        const file = files[i];
        const validation = validateImage(file);
        if (!validation.valid) {
            alert(`Error with file ${file.name}: ${validation.message}`);
            continue; // Skip invalid files
        }
        newFiles.push(file);
        try {
            const base64 = await fileToBase64(file);
            const compressed = await compressImageToMaxSize(base64, 300); // Compress before preview
            newPreviews.push(compressed);
        } catch (error) {
            console.error("Error processing file:", file.name, error);
            alert(`Could not process file ${file.name}`);
        }
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Clear the file input value so the same file can be selected again if removed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Remove a newly selected file (before submit)
  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove an existing image (during edit)
  const removeExistingImage = (index: number) => {
    const updatedExisting = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedExisting);
    // Also update formData immediately
    setFormData(prev => ({ ...prev, images: updatedExisting }));
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
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
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalImageCount = existingImages.length + selectedFiles.length;
    if (finalImageCount === 0) {
      alert('Please upload at least one image.');
      return;
    }
    if (finalImageCount > MAX_IMAGES) {
      alert(`You cannot have more than ${MAX_IMAGES} images.`);
      return; // Should be caught earlier, but double-check
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');

      // Process newly selected files into base64
      const newBase64Images = await Promise.all(
        selectedFiles.map(file => fileToBase64(file).then(base64 => compressImageToMaxSize(base64, 300)))
      );

      // Combine existing images (from state) and new base64 images
      const finalImages = [...existingImages, ...newBase64Images];

      // Prepare data, ensuring links are handled
      const finalFormData = {
        ...formData,
        images: finalImages, // Use the combined array
        link1: (formData.link1?.url ? formData.link1 : { name: '', url: '' }), // Ensure object structure
        link2: (formData.link2?.url ? formData.link2 : { name: '', url: '' }),
      };
       // Assign default names if URL exists but name is empty
      if (finalFormData.link1?.url && !finalFormData.link1.name) finalFormData.link1.name = 'Live Demo';
      if (finalFormData.link2?.url && !finalFormData.link2.name) finalFormData.link2.name = 'GitHub';


      if (isCreating) {
        const projectToCreate = {
          ...finalFormData,
          date: finalFormData.date || new Date().toISOString().split('T')[0]
        };
        const newProject = await api.createProject(projectToCreate as Omit<Project, '_id'>, token);
        setProjects(prev => [...prev, newProject]);
        resetForm();
      } else if (editingId) {
        const projectToUpdate: Partial<Project> = { ...finalFormData };
        const updated = await api.updateProject(editingId, projectToUpdate, token);
        setProjects(prev => prev.map(p => p._id === editingId ? updated : p));
        resetForm();
      }

      //resetForm(); 
      //await fetchProjects(); // Refetch to ensure sync

    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project deletion (keep as is)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      await api.deleteProject(id, token);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- Render Logic ---
  const totalCurrentImageCount = existingImages.length + selectedFiles.length;
  const canAddMoreImages = totalCurrentImageCount < MAX_IMAGES;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header and Add Button */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Manage your projects
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
              {/* Title, Description, Links, Technologies, Featured - Keep these inputs as they were */}
              {/* Title */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                 <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" required disabled={isSubmitting} />
               </div>
               {/* Description */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                 <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" rows={3} required disabled={isSubmitting} />
               </div>

              {/* --- Project Images Section (Modified) --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Images ({totalCurrentImageCount}/{MAX_IMAGES})
                </label>
                {/* Input for adding new images */}
                {canAddMoreImages && (
                    <input
                        type="file" accept="image/*" multiple // Allow multiple files
                        onChange={handleImageSelect}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 mb-4
                                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                                dark:file:bg-blue-900 dark:file:text-blue-200 cursor-pointer"
                        disabled={isSubmitting} ref={fileInputRef}
                    />
                )}
                 {!canAddMoreImages && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Maximum number of images reached.</p>
                 )}

                {/* Previews Area */}
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border dark:border-gray-600 rounded p-4">
                        {/* Existing Images (during edit) */}
                        {existingImages.map((imgSrc, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-video">
                                <Image src={imgSrc} alt={`Existing project image ${index + 1}`} layout="fill" className="object-contain rounded" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove existing image"
                                    disabled={isSubmitting}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        {/* New Image Previews */}
                        {imagePreviews.map((previewSrc, index) => (
                            <div key={`new-${index}`} className="relative group aspect-video">
                                <Image src={previewSrc} alt={`New image preview ${index + 1}`} layout="fill" className="object-contain rounded" />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove new image"
                                    disabled={isSubmitting}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                 {(existingImages.length === 0 && imagePreviews.length === 0) && (
                     <p className="text-sm text-gray-500 dark:text-gray-400">No images selected.</p>
                 )}
              </div>
              {/* --- End Project Images Section --- */}

              {/* Link 1 */}
               <fieldset className="border dark:border-gray-600 p-4 rounded">
                   <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 1</legend>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label><input type="text" value={formData.link1?.name || ''} onChange={(e) => handleLinkChange('link1', 'name', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g., Live Demo" disabled={isSubmitting} /></div>
                       <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label><input type="url" value={formData.link1?.url || ''} onChange={(e) => handleLinkChange('link1', 'url', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="https://example.com" disabled={isSubmitting} /></div>
                   </div>
               </fieldset>
               {/* Link 2 */}
               <fieldset className="border dark:border-gray-600 p-4 rounded">
                   <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 2</legend>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label><input type="text" value={formData.link2?.name || ''} onChange={(e) => handleLinkChange('link2', 'name', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g., GitHub" disabled={isSubmitting} /></div>
                       <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label><input type="url" value={formData.link2?.url || ''} onChange={(e) => handleLinkChange('link2', 'url', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="https://github.com/repo" disabled={isSubmitting} /></div>
                   </div>
               </fieldset>
               {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (press Enter)</label>
                  <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={handleTechKeyPress} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="React, Next.js..." disabled={isSubmitting} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies?.map((tech, index) => (<span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{tech}<button type="button" onClick={() => removeTech(index)} className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">×</button></span>))}
                  </div>
                </div>
                {/* Featured */}
                <div className="flex items-center">
                  <input type="checkbox" id="featured" checked={formData.featured || false} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded" disabled={isSubmitting} />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Featured Project</label>
                </div>


              {/* Form Buttons */}
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Project'}</button>
                <button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50" disabled={isSubmitting}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* --- Project List Section --- */}
        {projects.length === 0 && !isCreating ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
            {isAdminUser && (
                <button onClick={handleCreateNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4">Add Your First Project</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project._id} className="relative group">
                <ProjectCard project={project} />
                {isAdminUser && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => handleEdit(project)} className="p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Edit project" disabled={isSubmitting}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" aria-label="Delete project" disabled={isSubmitting}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}