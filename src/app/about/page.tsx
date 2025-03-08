'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { AboutMe } from '@/types';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function AboutPage() {
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedAbout, setEditedAbout] = useState<AboutMe | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const aboutData = await api.getAbout();
      setAbout(aboutData);
      if (aboutData) {
        setImagePreview(aboutData.imageData || aboutData.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching about information:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  useEffect(() => {
    if (about) {
      setEditedAbout(about);
    }
  }, [about]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAbout(about);
    setSelectedImage(null);
    setImagePreview(about?.imageData || about?.imageUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    const resized = await resizeImage(base64);
    setImagePreview(resized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedAbout) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      const updatedAbout = { ...editedAbout };
      
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        const resized = await resizeImage(base64);
        updatedAbout.imageData = resized;
        updatedAbout.imageUrl = undefined;
      }
      
      await api.updateAbout(updatedAbout, token);
      setAbout(updatedAbout);
      setIsEditing(false);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating about information:', error);
      alert('Failed to update about information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !about) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isEditing && isAdminUser && editedAbout ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit About Information</h1>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editedAbout.name}
                  onChange={(e) => setEditedAbout({ ...editedAbout, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedAbout.title}
                  onChange={(e) => setEditedAbout({ ...editedAbout, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isSubmitting}
                      ref={fileInputRef}
                    />
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImage ? selectedImage.name : 'No file chosen'}
                  </span>
                </div>
                {imagePreview && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio <span className="text-xs text-gray-500">(Supports Markdown)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      You can use **bold**, *italic*, - bullet lists, and other Markdown formatting
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                  
                  {showPreview ? (
                    <div className="p-3 border rounded dark:bg-gray-800 dark:border-gray-700 prose dark:prose-invert max-w-none min-h-[8rem]">
                      <ReactMarkdown>{editedAbout.bio}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={editedAbout.bio}
                      onChange={(e) => setEditedAbout({ ...editedAbout, bio: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editedAbout.location}
                  onChange={(e) => setEditedAbout({ ...editedAbout, location: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedAbout.phone || ''}
                  onChange={(e) => setEditedAbout({ ...editedAbout, phone: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="+1 (123) 456-7890"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedAbout.email}
                  onChange={(e) => setEditedAbout({ ...editedAbout, email: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white">Social Links</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.github}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, github: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://github.com/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.linkedin}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, linkedin: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://linkedin.com/in/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.twitter}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://twitter.com/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{about.name}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">{about.title}</p>
                </div>
                
                {isAdminUser && (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {/* Display profile image */}
              {(about.imageData || about.imageUrl) && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={about.imageData || about.imageUrl} 
                    alt={about.name}
                    className="w-48 h-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About Me</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{about.bio}</ReactMarkdown>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Location:</span> {about.location}
                    </p>
                    {about.phone && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Phone:</span>{' '}
                        <a href={`tel:${about.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {about.phone}
                        </a>
                      </p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${about.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {about.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Social Links</h2>
                  <div className="flex space-x-4">
                    {about.socialLinks.github && (
                      <a
                        href={about.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        GitHub
                      </a>
                    )}
                    {about.socialLinks.linkedin && (
                      <a
                        href={about.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        LinkedIn
                      </a>
                    )}
                    {about.socialLinks.twitter && (
                      <a
                        href={about.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
