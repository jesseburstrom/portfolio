import { AboutMe, Project, Skill, Experience, Category } from '../types';
import { fallbackAboutMe, fallbackProjects, fallbackExperiences } from '../data/fallback';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- Fallback Categories (Keep for Category API fallback if desired) ---
// Define some basic fallback categories if the CATEGORY API fails
const fallbackCategories: Category[] = [
  { _id: 'cat_prog', key: 'programming', displayName: 'Programming' },
  { _id: 'cat_db', key: 'database', displayName: 'Database' },
  { _id: 'cat_devtool', key: 'development tools', displayName: 'Development Tools' },
  { _id: 'cat_plat', key: 'tools & platforms', displayName: 'Tools & Platforms' },
  { _id: 'cat_method', key: 'development methodologies', displayName: 'Development Methodologies' },
  { _id: 'cat_os', key: 'operating systems', displayName: 'Operating Systems' },
  { _id: 'cat_other', key: 'other', displayName: 'Other' },
];
// --- End Fallback Categories -

async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API request failed for ${endpoint}: ${response.statusText}`);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const responseData = await response.json();

    // --- MODIFICATION START ---
    // Check if the response has a 'data' property which holds the actual payload
    // (Common pattern for backend responses like { status: 'success', data: [...] })
    // Also check if responseData itself is not null/undefined before accessing .data
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
       // If responseData.data exists, return it. Handle null/undefined case for data itself.
       return responseData.data ?? fallbackData;
    }
    // --- MODIFICATION END ---

    // Otherwise, assume the response itself is the data (like for skills/experiences)
    // Return the response data or the fallback if responseData is null/undefined
    return responseData ?? fallbackData;

  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}, using fallback data:`, error);
    return fallbackData;
  }
}
// Project API calls

// --- Category API Calls ---
const getCategories = async (): Promise<Category[]> => {
  // Using fetchWithFallback for categories might still be useful
  return fetchWithFallback<Category[]>('/categories', fallbackCategories);
  /* Or direct fetch:
  try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.data || []; // Adjust if backend wraps response
  } catch (error) {
      console.error('Failed to fetch categories:', error);
      return []; // Return empty on error instead of fallback
  }
  */
};
const createCategory = async (category: Omit<Category, '_id'>, token: string): Promise<Category> => { /* ... unchanged ... */
  const response = await fetch(`${API_BASE_URL}/api/categories`, { method: 'POST', headers: {'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify(category) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed create'); }
  const data = await response.json(); return data.data;
};
const updateCategory = async (id: string, category: Partial<Omit<Category, '_id' | 'key'>>, token: string): Promise<Category> => { /* ... unchanged ... */
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify(category) });
  if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed update'); }
  const data = await response.json(); return data.data;
};
const deleteCategory = async (id: string, token: string): Promise<void> => { /* ... unchanged ... */
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: 'DELETE', headers: {Authorization: `Bearer ${token}`} });
   if (!response.ok && response.status !== 204) { // Allow 204 No Content
      let msg = `Failed delete category (Status: ${response.status})`;
      try { const err = await response.json(); msg = err.message || msg; } catch(e){}
      throw new Error(msg);
   }
};
// --- End Category API Calls ---

const getProject = async (id: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  if (!response.ok) throw new Error('Failed to fetch project');
  const data = await response.json();
  return data.data;
};

const createProject = async (project: Omit<Project, '_id'>, token: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }
  
  const data = await response.json();
  return data.data;
};

const updateProject = async (id: string, project: Partial<Project>, token: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update project');
  }
  
  const data = await response.json();
  return data.data;
};

const deleteProject = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete project');
  }
};

// --- Skill API Calls (Simplified getSkills) ---
const getSkills = async (): Promise<Skill[]> => {
  try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/skills`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
          console.error(`API request failed for /skills: ${response.statusText}`);
          throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json(); // Expecting direct array of populated skills

      // *** REMOVED FALLBACK OVERRIDE LOGIC ***

      // Return API data (should be populated) or empty array if API returns null/undefined
      return data || [];

  } catch (error) {
      console.error(`Failed to fetch /skills:`, error);
      // Return an empty array on any fetch error instead of using fallbacks
      return [];
  }
};

// createSkill needs to accept category ID
const createSkill = async (skillData: { name: string; category: string; }, token: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(skillData) // Send { name: 'React', category: 'cat_id_string' }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create skill');
  }
  const data = await response.json();
  return data; // Expecting populated skill from backend now
};

// updateSkill needs to accept category ID
const updateSkill = async (id: string, skillData: Partial<{ name: string; category: string; }>, token: string): Promise<Skill> => {
   const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
       body: JSON.stringify(skillData)
   });
   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update skill');
  }
    const data = await response.json();
    return data; // Expecting populated skill from backend now
};

const deleteSkill = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete skill');
  }
};

// About API calls
const getAbout = async (): Promise<AboutMe> => {
  return fetchWithFallback<AboutMe>('/about', fallbackAboutMe);
};

const updateAbout = async (about: Partial<AboutMe>, token: string): Promise<AboutMe> => {
  const response = await fetch(`${API_BASE_URL}/api/about`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(about)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update about information');
  }
  
  const data = await response.json();
  return data.data;
};

// Experience API calls
const getExperiences = async (): Promise<Experience[]> => {
  return fetchWithFallback<Experience[]>('/experiences', fallbackExperiences);
};

const getExperience = async (id: string): Promise<Experience> => {
  return fetchWithFallback<Experience>(`/experiences/${id}`, fallbackExperiences[0]);
};

const createExperience = async (experience: Omit<Experience, '_id'>, token: string): Promise<Experience> => {
  const response = await fetch(`${API_BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(experience)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create experience');
  }
  
  const data = await response.json();
  return data;
};

const updateExperience = async (id: string, experience: Partial<Experience>, token: string): Promise<Experience> => {
  const response = await fetch(`${API_BASE_URL}/api/experiences/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(experience)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update experience');
  }
  
  const data = await response.json();
  return data;
};

const deleteExperience = async (id: string, token: string): Promise<void> => {
  console.log(`Attempting to delete experience with ID: ${id}`);
  console.log(`API URL: ${API_BASE_URL}/api/experiences/${id}`);
  
  try {
    // Make sure the URL is properly formatted
    const url = new URL(`${API_BASE_URL}/api/experiences/${id}`);
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Delete response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `Failed to delete experience (Status: ${response.status})`;
      
      try {
        const errorData = await response.json();
        console.error('Delete experience error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Error parsing error response:', jsonError);
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('Experience deleted successfully');
  } catch (error) {
    console.error('Error in deleteExperience function:', error);
    throw error;
  }
};

export const api = {
  getProjects: () => fetchWithFallback<Project[]>('/projects', fallbackProjects),
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  //getSkills: () => fetchWithFallback<Skill[]>('/skills', fallbackSkills),
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getAbout,
  updateAbout,
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience
};
