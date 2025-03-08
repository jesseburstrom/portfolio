import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Skill } from '@/types/skill';

interface AdminSkillsManagerProps {
  skills: Skill[];
  onUpdate: () => void;
}

export default function AdminSkillsManager({ skills, onUpdate }: AdminSkillsManagerProps) {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: 'frontend',
    proficiency: 1,
  });

  const handleEdit = async (skill: Skill) => {
    setEditingSkill(skill);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete skill');
      onUpdate();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${editingSkill._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(editingSkill),
      });

      if (!response.ok) throw new Error('Failed to update skill');
      setEditingSkill(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) throw new Error('Failed to create skill');
      setNewSkill({ name: '', category: 'frontend', proficiency: 1 });
      onUpdate();
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Add New Skill</h3>
        <form onSubmit={handleSubmitNew} className="space-y-4">
          <div>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="Skill name"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="tools">Tools</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              min="1"
              max="5"
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add Skill
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Manage Skills</h3>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill._id} className="flex items-center justify-between p-4 border rounded">
              {editingSkill?._id === skill._id ? (
                <form onSubmit={handleSubmitEdit} className="w-full space-y-2">
                  <input
                    type="text"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <select
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingSkill.proficiency}
                    onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold">{skill.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.category} - Proficiency: {skill.proficiency}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
