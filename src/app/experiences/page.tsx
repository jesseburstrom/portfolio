'use client';

import { useState, useEffect } from 'react';
import ExperienceSection from '@/components/ExperienceSection';
import { api } from '@/services/api';
import { Experience } from '@/types';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  // Handler for experience updates from the ExperienceSection component
  const handleExperienceUpdate = (updatedExperiences: Experience[]) => {
    console.log('Parent received updated experiences:', updatedExperiences);
    setExperiences(updatedExperiences);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Professional Experience
        </h1>

        {loading ? (
          <div className="text-center py-10">Loading experiences...</div>
        ) : (
          <ExperienceSection 
            experiences={experiences} 
            showAdminControls={true} 
            onExperienceUpdate={handleExperienceUpdate}
          />
        )}
      </div>
    </main>
  );
}
