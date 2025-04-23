'use client';

import { useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Project } from '@/types';
import { api } from '@/services/api';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';

interface AdminProjectsManagerProps {
  projects: Project[];
  onUpdate: () => void;
}

// Helper to initialize link state
const initialLinkState = (defaultName: string) => ({ name: defaultName, url: '' });

export default function AdminProjectsManager({ projects, onUpdate }: AdminProjectsManagerProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    link1: initialLinkState('Live Demo'),
    link2: initialLinkState('GitHub'),
    technologies: [],
    featured: false,
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const resized = await resizeImage(base64);
    setImagePreview(resized);
  };

  const handleTechKeyPress = (e: React.KeyboardEvent, target: 'new' | 'edit') => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (target === 'new') {
        setNewProject(prev => ({
          ...prev,
          technologies: [...(prev.technologies || []), techInput.trim()]
        }));
      } else if (editingProject) {
        setEditingProject({
          ...editingProject,
          technologies: [...editingProject.technologies, techInput.trim()]
        });
      }
      setTechInput('');
    }
  };

  const removeTech = (index: number, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewProject(prev => ({
        ...prev,
        technologies: prev.technologies?.filter((_, i) => i !== index) || []
      }));
    } else if (editingProject) {
      setEditingProject({
        ...editingProject,
        technologies: editingProject.technologies.filter((_, i) => i !== index)
      });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setImagePreview('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setIsSubmitting(true);
      await api.deleteProject(id, getAuthToken() || '');
      onUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setIsSubmitting(true);
      const updatedProject = { ...editingProject };
      
      if (selectedImage) {
        //const base64 = await fileToBase64(selectedImage);
        //const resized = await resizeImage(base64);
        // updatedProject.imageData = resized;
        // updatedProject.imageUrl = undefined;
      }

      await api.updateProject(editingProject._id, updatedProject, getAuthToken() || '');
      setEditingProject(null);
      setSelectedImage(null);
      setImagePreview('');
      onUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image for the project');
      return;
    }

    try {
      setIsSubmitting(true);
      const base64 = await fileToBase64(selectedImage);
      const resized = await resizeImage(base64);
      
      const projectToCreate = {
        ...newProject,
        imageData: resized,
        date: new Date().toISOString().split('T')[0]
      };

      await api.createProject(projectToCreate as Omit<Project, '_id'>, getAuthToken() || '');
      setNewProject({
        title: '',
        description: '',
        link1: initialLinkState('Live Demo'),
        link2: initialLinkState('GitHub'),
        technologies: [],
        featured: false
      });
      setSelectedImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await onUpdate();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkChange = (
    target: 'new' | 'edit',          // Which state object to update ('newProject' or 'editingProject')
    linkIndex: 'link1' | 'link2',    // Which link object within the state ('link1' or 'link2')
    field: 'name' | 'url',           // Which property of the link object ('name' or 'url')
    value: string                    // The new value from the input
  ) => {
    if (target === 'new') {
      // Update the newProject state
      setNewProject(prev => ({
        ...prev, // Keep existing properties
        // Update the specific link object (link1 or link2)
        [linkIndex]: {
          ...(prev[linkIndex] || {}), // Spread the existing link object (or an empty object if it doesn't exist yet)
          [field]: value              // Update the specific field (name or url) with the new value
        }
      }));
    } else if (editingProject) {
      // Update the editingProject state (ensure it's not null)
      setEditingProject(prev => prev ? ({ // Check if prev (editingProject state) is not null
        ...prev, // Keep existing properties
        // Update the specific link object (link1 or link2)
        [linkIndex]: {
          ...(prev[linkIndex] || {}), // Spread the existing link object
          [field]: value              // Update the specific field (name or url)
        }
      }) : null); // If prev was null, return null (shouldn't happen in this flow but safe)
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Project Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Project</h3>
        <form onSubmit={handleSubmitNew} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
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
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         dark:file:bg-blue-900 dark:file:text-blue-200"
                disabled={isSubmitting}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
          <fieldset className="border dark:border-gray-600 p-4 rounded">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 1</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input for Link 1 Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newProject.link1?.name || ''} // Use optional chaining and default
                  // Use handleLinkChange to update newProject.link1.name
                  onChange={(e) => handleLinkChange('new', 'link1', 'name', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., Live Demo"
                  disabled={isSubmitting}
                />
              </div>
              {/* Input for Link 1 URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={newProject.link1?.url || ''} // Use optional chaining and default
                  // Use handleLinkChange to update newProject.link1.url
                  onChange={(e) => handleLinkChange('new', 'link1', 'url', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>

          {/* --- ADD THIS BLOCK for Link 2 --- */}
          <fieldset className="border dark:border-gray-600 p-4 rounded">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 2</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input for Link 2 Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newProject.link2?.name || ''} // Use optional chaining and default
                  // Use handleLinkChange to update newProject.link2.name
                  onChange={(e) => handleLinkChange('new', 'link2', 'name', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., GitHub Repo"
                  disabled={isSubmitting}
                />
              </div>
              {/* Input for Link 2 URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={newProject.link2?.url || ''} // Use optional chaining and default
                  // Use handleLinkChange to update newProject.link2.url
                  onChange={(e) => handleLinkChange('new', 'link2', 'url', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://github.com/repo"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologies (Press Enter to add)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => handleTechKeyPress(e, 'new')}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Enter a technology..."
              disabled={isSubmitting}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {newProject.technologies?.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(index, 'new')}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-2 px-4 rounded transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Edit Project Form */}
      {editingProject && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Project</h3>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
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
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
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
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100
                           dark:file:bg-blue-900 dark:file:text-blue-200"
                  disabled={isSubmitting}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
            {/* --- ADD THIS BLOCK for Link 1 (Edit Mode) --- */}
          <fieldset className="border dark:border-gray-600 p-4 rounded">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 1</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input for Link 1 Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  // Read value from editingProject state
                  value={editingProject?.link1?.name || ''}
                  // Use handleLinkChange targeting 'edit' state
                  onChange={(e) => handleLinkChange('edit', 'link1', 'name', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., Live Demo"
                  disabled={isSubmitting}
                />
              </div>
              {/* Input for Link 1 URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                   // Read value from editingProject state
                  value={editingProject?.link1?.url || ''}
                  // Use handleLinkChange targeting 'edit' state
                  onChange={(e) => handleLinkChange('edit', 'link1', 'url', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>

          {/* --- ADD THIS BLOCK for Link 2 (Edit Mode) --- */}
          <fieldset className="border dark:border-gray-600 p-4 rounded">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Link 2</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input for Link 2 Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                   // Read value from editingProject state
                  value={editingProject?.link2?.name || ''}
                  // Use handleLinkChange targeting 'edit' state
                  onChange={(e) => handleLinkChange('edit', 'link2', 'name', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., GitHub Repo"
                  disabled={isSubmitting}
                />
              </div>
              {/* Input for Link 2 URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                   // Read value from editingProject state
                  value={editingProject?.link2?.url || ''}
                  // Use handleLinkChange targeting 'edit' state
                  onChange={(e) => handleLinkChange('edit', 'link2', 'url', e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://github.com/repo"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technologies (Press Enter to add)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => handleTechKeyPress(e, 'edit')}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Enter a technology..."
                disabled={isSubmitting}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {editingProject.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(index, 'edit')}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className={`flex-1 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2 px-4 rounded transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setSelectedImage(null);
                  setImagePreview('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Existing Projects</h3>
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center"
            >
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
