'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { Project } from '@/types';
import Image from 'next/image';
import { fileToBase64, validateImage, compressImageToMaxSize } from '@/utils/imageUtils';

export default function ProjectsPage() {
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
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    liveUrl: '',
    githubUrl: '',
    technologies: [],
    featured: false
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
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      liveUrl: '',
      githubUrl: '',
      technologies: [],
      featured: false
    });
    setIsCreating(false);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview('');
    setTechInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    resetForm();
  };
  
  const handleEdit = (project: Project) => {
    setIsCreating(false);
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies,
      featured: project.featured || false
    });
    setImagePreview(project.imageData || project.imageUrl || '');
  };
  
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (!selectedImage) {
          alert('Please select an image for the project');
          setIsSubmitting(false);
          return;
        }
        
        const base64 = await fileToBase64(selectedImage);
        const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
        
        const projectToCreate = {
          ...formData,
          imageData: compressed,
          date: new Date().toISOString().split('T')[0]
        };

        const newProject = await api.createProject(projectToCreate as Omit<Project, '_id'>, token);
        setProjects([...projects, newProject]);
      } else if (editingId) {
        const updatedProject = { ...formData } as Project;
        updatedProject._id = editingId;
        
        if (selectedImage) {
          const base64 = await fileToBase64(selectedImage);
          const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
          updatedProject.imageData = compressed;
          updatedProject.imageUrl = undefined;
        } else if (imagePreview) {
          // Keep existing image if no new one was selected
          const existingProject = projects.find(p => p._id === editingId);
          if (existingProject) {
            updatedProject.imageData = existingProject.imageData;
            updatedProject.imageUrl = existingProject.imageUrl;
          }
        }

        const updated = await api.updateProject(editingId, updatedProject, token);
        setProjects(projects.map(project => project._id === editingId ? updated : project));
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      await api.deleteProject(id, token);
      setProjects(projects.filter(project => project._id !== id));
      
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Here are some of the projects I&apos;ve worked on
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
        
        {/* Project Form for Admin */}
        {isAdminUser && (isCreating || editingId) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isCreating ? 'Add New Project' : 'Edit Project'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Image
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    disabled={isSubmitting}
                  >
                    Browse for image...
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedImage ? selectedImage.name : imagePreview ? 'Current image selected' : 'No image selected'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                  ref={fileInputRef}
                />
                {imagePreview && (
                  <div className="mt-2 relative h-40 w-full">
                    <Image
                      src={imagePreview}
                      alt="Project preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Live URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://github.com/username/repo"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Technologies (press Enter after each)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyPress}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="React, Next.js, etc."
                  disabled={isSubmitting}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies?.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(index)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Project
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Project'}
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

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
            {isAdminUser && !isCreating && (
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
              <div
                key={project._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative pb-[56.25%] bg-gray-50 dark:bg-gray-900 mt-4">
                  <Image
                    src={project.imageData || project.imageUrl || '/placeholder-project.svg'}
                    alt={project.title}
                    fill
                    className="object-contain p-2"
                    priority={false}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                    
                    {/* Admin Controls */}
                    {isAdminUser && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
