'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { api } from '@/services/api';
import { Project, Skill, AboutMe, Experience } from '@/types';
import AdminSkillsManager from '@/components/AdminSkillsManager';
import AdminProjectsManager from '@/components/AdminProjectsManager';
import AdminAboutManager from '@/components/AdminAboutManager';
import AdminExperienceManager from '@/components/AdminExperienceManager';
import Image from 'next/image'; // Import Image

// Define props if needed, though we fetch data internally here
// interface AdminDashboardProps { }

export default function AdminDashboard(/* props: AdminDashboardProps */) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'about' | 'experiences'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPageAdmin, setIsPageAdmin] = useState(false); // Track admin status locally

  useEffect(() => {
    const adminStatus = isAdmin();
    setIsPageAdmin(adminStatus);
    if (!adminStatus) {
      router.push('/');
      return; // Early exit if not admin
    }

    // Set active tab based on URL parameter
    const validTabs = ['skills', 'projects', 'about', 'experiences'];
    if (tabParam && validTabs.includes(tabParam)) {
       setActiveTab(tabParam as typeof activeTab);
    } else {
       // Default to 'skills' if tabParam is invalid or missing
       setActiveTab('skills');
       // Optionally update URL if needed, though maybe not necessary
       // router.replace('/admin?tab=skills');
    }

    const fetchData = async () => {
      setLoading(true); // Set loading true when fetching starts
      try {
        const [skillsData, projectsData, aboutData, experiencesData] = await Promise.all([
          api.getSkills(),
          api.getProjects(),
          api.getAbout(),
          api.getExperiences()
        ]);

        console.log('Fetched experiences:', experiencesData);

        setSkills(skillsData);
        setProjects(projectsData);
        setAbout(aboutData);
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error state if necessary
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, tabParam]); // Re-run if tabParam changes

  // Separate useEffect for tabParam change to only update the active tab state
  // This prevents redundant data fetching unless explicitly desired on tab change
  useEffect(() => {
      const validTabs = ['skills', 'projects', 'about', 'experiences'];
      if (tabParam && validTabs.includes(tabParam)) {
          setActiveTab(tabParam as typeof activeTab);
      } else if (isPageAdmin) { // Only default if user is admin and tab is invalid
          setActiveTab('skills');
      }
  }, [tabParam, isPageAdmin]);


  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const [projectsData, skillsData, aboutData, experiencesData] = await Promise.all([
        api.getProjects(),
        api.getSkills(),
        api.getAbout(),
        api.getExperiences()
      ]);

      setSkills(skillsData);
      setProjects(projectsData);
      setAbout(aboutData);
      setExperiences(experiencesData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Important: Check admin status *before* rendering sensitive content
  if (!isPageAdmin) {
     // Render nothing or a redirecting message while router pushes
     return <div className="min-h-screen flex items-center justify-center"><p>Redirecting...</p></div>;
  }

  if (loading || !about) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loading Admin Dashboard...</h2>
            {/* Optional: Add a spinner */}
            <div className="mt-4 inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle tab clicks and update URL
  const handleTabClick = (tab: typeof activeTab) => {
      setActiveTab(tab);
      router.push(`/admin?tab=${tab}`, { scroll: false }); // Update URL without full page reload
  };


  return (
    // This is the JSX previously in AdminPage
     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your portfolio content</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['skills', 'projects', 'experiences', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)} // Use handler to update URL
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

         {/* About Information Summary (conditionally rendered) */}
        {activeTab === 'about' && about && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{about.name}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{about.title}</p>

              {/* {(about.imageData || about.imageUrl) && (
                <div className="flex justify-center mb-6">
                  <Image // Use next/image
                      src={imageSource}
                      alt={about.name}
                      width={192} // w-48
                      height={192} // Estimate height
                      className="rounded-lg shadow-md object-contain"
                    />
                </div>
              )} */}
                {/* --- START CHANGE --- */}
              {(() => {
                // Calculate the source inside this scope
                const imageSource = about.imageData || about.imageUrl;
                // Explicitly check if imageSource is a valid string
                if (imageSource) {
                  return (
                    <div className="flex justify-center mb-6">
                      <Image
                        src={imageSource} // TS knows imageSource is a string here
                        alt={about.name}
                        width={192} // w-48
                        height={192} // Estimate height
                        className="rounded-lg shadow-md object-contain"
                      />
                    </div>
                  );
                }
                // Return null or an empty fragment if no image source
                return null;
              })()}
              {/* --- END CHANGE --- */}
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-left prose dark:prose-invert">
                {/* Using ReactMarkdown if bio contains markdown */}
                {about.bio}
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
          {activeTab === 'experiences' && (
            <>
              {/* Removed debug info */}
              <AdminExperienceManager experiences={experiences} onUpdate={handleRefreshData} />
            </>
          )}
          {activeTab === 'about' && about && ( // Ensure 'about' is not null
            <AdminAboutManager about={about} onUpdate={handleRefreshData} />
          )}
        </div>
      </div>
    </div>
  );
}