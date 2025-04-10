import { AboutMe, Project, Skill, Experience } from '../types';
import { fallbackAboutMe, fallbackProjects, fallbackSkills, fallbackExperiences } from '../data/fallback';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`API request failed for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}, using fallback data:`, error);
    return fallbackData;
  }
}

// Project API calls

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

// Skill API calls
const getSkill = async (id: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`);
  if (!response.ok) throw new Error('Failed to fetch skill');
  const data = await response.json();
  return data.data;
};

const createSkill = async (skill: Omit<Skill, '_id'>, token: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(skill)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create skill');
  }
  
  const data = await response.json();
  return data.data;
};

const updateSkill = async (id: string, skill: Partial<Skill>, token: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(skill)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update skill');
  }
  
  const data = await response.json();
  return data.data;
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
  getSkills: () => fetchWithFallback<Skill[]>('/skills', fallbackSkills),
  getSkill,
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
