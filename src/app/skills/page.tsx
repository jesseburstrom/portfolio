'use client';

import { useState, useEffect } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';

interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number;
}

const CATEGORY_LABELS = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  tools: 'Development Tools',
  other: 'Other Skills'
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Skill, '_id'>>({
    name: '',
    category: 'frontend',
    proficiency: 1
  });

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch skills');
      const data = await response.json();
      setSkills(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Error loading skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'frontend',
      proficiency: 1
    });
    setIsCreating(false);
    setEditingId(null);
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      category: 'frontend',
      proficiency: 1
    });
  };
  
  const handleEdit = (skill: Skill) => {
    setIsCreating(false);
    setEditingId(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to create skill');
        const newSkill = await response.json();
        setSkills([...skills, newSkill]);
      } else if (editingId) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to update skill');
        const updatedSkill = await response.json();
        setSkills(skills.map(skill => skill._id === editingId ? updatedSkill : skill));
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete skill');
      setSkills(skills.filter(skill => skill._id !== id));
      
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Get categories that have skills
  const activeCategories = Object.entries(groupedSkills).filter(([_, skills]) => skills.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center">Skills</h1>
        
        {isAdminUser && !isCreating && !editingId && (
          <button
            onClick={handleCreateNew}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add New Skill
          </button>
        )}
      </div>
      
      {/* Skill Form for Admin */}
      {isAdminUser && (isCreating || editingId) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {isCreating ? 'Add New Skill' : 'Edit Skill'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Skill['category'] })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Skill'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeCategories.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No skills found. {isAdminUser && 'Use the Add New Skill button to add skills.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {activeCategories.map(([category, categorySkills]) => (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h2>
              <div className="space-y-6">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                          {skill.proficiency}/5
                        </span>
                        {isAdminUser && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(skill)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(skill._id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
