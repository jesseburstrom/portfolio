import ExperienceSection from '@/components/ExperienceSection';
import { api } from '@/services/api';

export default async function ExperiencesPage() {
  // Fetch experiences data
  const experiences = await api.getExperiences();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Professional Experience
        </h1>

        {/* Pass experiences to the ExperienceSection component */}
        <ExperienceSection experiences={experiences} />
      </div>
    </main>
  );
}
