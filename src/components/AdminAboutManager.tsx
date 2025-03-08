'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { AboutMe } from '@/types';
import { api } from '@/services/api';

interface AdminAboutManagerProps {
  about: AboutMe;
  onUpdate: () => void;
}

export default function AdminAboutManager({ about, onUpdate }: AdminAboutManagerProps) {
  const [editedAbout, setEditedAbout] = useState<AboutMe>(about);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await api.updateAbout(editedAbout, getAuthToken() || '');
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
