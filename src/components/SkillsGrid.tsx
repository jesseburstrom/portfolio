import { isAdmin } from '@/lib/auth';
import type { Skill } from '@/types';
import AdminSkillsManager from './AdminSkillsManager';

interface SkillsGridProps {
  skills: Skill[];
  onUpdate?: () => void;
}

const CATEGORY_LABELS = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  tools: 'Development Tools',
  other: 'Other Skills'
} as const;

export default function SkillsGrid({ skills, onUpdate }: SkillsGridProps) {
  const categories = ['frontend', 'backend', 'tools', 'other'] as const;
  const adminStatus = isAdmin();

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const categorySkills = skills.filter((skill) => skill.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-6">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Controls */}
      {adminStatus && onUpdate && (
        <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Manage Skills
          </h2>
          <AdminSkillsManager skills={skills} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
