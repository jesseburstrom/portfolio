'use client';

import { useState, useEffect } from 'react';
import { isAdmin } from '@/lib/auth';
import { api } from '@/services/api';
import { AboutMe } from '@/types';
import AdminAboutManager from '@/components/AdminAboutManager';

export default function AboutPage() {
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const aboutData = await api.getAbout();
      setAbout(aboutData);
    } catch (error) {
      console.error('Error fetching about information:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{about.name}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{about.title}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About Me</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{about.bio}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h2>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Location:</span> {about.location}
                  </p>
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
      </div>
      
      {/* Admin Controls */}
      {isAdminUser && (
        <div className="mt-12 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Edit About Information</h2>
          <AdminAboutManager about={about} onUpdate={fetchAbout} />
        </div>
      )}
    </div>
  );
}
