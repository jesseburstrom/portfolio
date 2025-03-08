'use client';

import { useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import { AboutMe } from '@/types';
import { api } from '@/services/api';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';

interface AdminAboutManagerProps {
  about: AboutMe;
  onUpdate: () => void;
}

export default function AdminAboutManager({ about, onUpdate }: AdminAboutManagerProps) {
  const [editedAbout, setEditedAbout] = useState<AboutMe>(about);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(about.imageData || about.imageUrl || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const updatedAbout = { ...editedAbout };
      
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        const resized = await resizeImage(base64);
        updatedAbout.imageData = resized;
        updatedAbout.imageUrl = undefined;
      }
      
      await api.updateAbout(updatedAbout, getAuthToken() || '');
      await onUpdate();
    } catch (error) {
      console.error('Error updating about information:', error);
      alert('Failed to update about information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit About Information</h3>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={editedAbout.bio}
            onChange={(e) => setEditedAbout({ ...editedAbout, bio: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            rows={4}
            required
            disabled={isSubmitting}
          />
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
        <button
          type="submit"
          className={`w-full ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-2 px-4 rounded transition-colors`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
