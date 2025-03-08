'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { api } from '@/services/api';
import { Project, Skill, AboutMe } from '@/types';
import AdminSkillsManager from '@/components/AdminSkillsManager';
import AdminProjectsManager from '@/components/AdminProjectsManager';
import AdminAboutManager from '@/components/AdminAboutManager';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'about'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
      return;
    }

    // Set active tab based on URL parameter
    if (tabParam === 'projects' || tabParam === 'about' || tabParam === 'skills') {
      setActiveTab(tabParam);
    }

    const fetchData = async () => {
      try {
        const [skillsData, projectsData, aboutData] = await Promise.all([
          api.getSkills(),
          api.getProjects(),
          api.getAbout()
        ]);

        setSkills(skillsData);
        setProjects(projectsData);
        setAbout(aboutData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, tabParam]);

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const [skillsData, projectsData, aboutData] = await Promise.all([
        api.getSkills(),
        api.getProjects(),
        api.getAbout()
      ]);

      setSkills(skillsData);
      setProjects(projectsData);
      setAbout(aboutData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return null;
  }

  if (loading || !about) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your portfolio content</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['skills', 'projects', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* About Information Summary (shown only when About tab is active) */}
        {activeTab === 'about' && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{about.name}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{about.title}</p>
              
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
              
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {about.bio.length > 150 ? `${about.bio.substring(0, 150)}...` : about.bio}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'skills' && (
            <AdminSkillsManager skills={skills} onUpdate={handleRefreshData} />
          )}
          {activeTab === 'projects' && (
            <AdminProjectsManager projects={projects} onUpdate={handleRefreshData} />
          )}
          {activeTab === 'about' && (
            <AdminAboutManager about={about} onUpdate={handleRefreshData} />
          )}
        </div>
      </div>
    </div>
  );
}
