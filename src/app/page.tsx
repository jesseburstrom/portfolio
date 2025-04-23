import AboutSection from '@/components/AboutSection';
import ProjectCard from '@/components/ProjectCard';
//import SkillsGrid from '@/components/SkillsGrid';
import TechnicalSkillsList from '@/components/TechnicalSkillsList'; // Import the new component
import ExperienceSection from '@/components/ExperienceSection';
import { api } from '@/services/api';

export default async function Home() {
  // Fetch all data in parallel
  const [projects, skills, about, experiences] = await Promise.all([
    api.getProjects(),
    api.getSkills(),
    api.getAbout(),
    api.getExperiences(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* About Section */}
        <AboutSection about={about} />
        {/* Skills Section */}
        <section>
          <TechnicalSkillsList skills={skills} />
        </section>
        {/* Experience Section */}
        <ExperienceSection experiences={experiences} />
        {/* Projects Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
        
      </div>
    </main>
  );
}
