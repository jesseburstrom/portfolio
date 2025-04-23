// src/app/skills/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { Skill, Category } from '@/types';
import { useRouter } from 'next/navigation';

function capitalizeWords(str: string): string {
    return str?.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) ?? '';
}

export default function SkillsAdminPage() {
    // --- Existing Skill States ---
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loadingSkills, setLoadingSkills] = useState(true); // Renamed for clarity
    const [skillError, setSkillError] = useState<string | null>(null); // Renamed for clarity
    const [isCreatingSkill, setIsCreatingSkill] = useState(false); // Renamed for clarity
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null); // Renamed for clarity
    const [isSkillSubmitting, setIsSkillSubmitting] = useState(false); // Renamed for clarity
    const [skillFormData, setSkillFormData] = useState<{ name: string; category: string }>({ name: '', category: '' });

    // --- NEW Category States ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true); // Separate loading
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState<Omit<Category, '_id'>>({ key: '', displayName: '', order: 0 });

    // --- Other States ---
    const [isAdminUser, setIsAdminUser] = useState(false);
    const router = useRouter();

    // Initial Fetch (Skills and Categories)
    useEffect(() => {
        const adminStatus = isAdmin();
        setIsAdminUser(adminStatus);
        if (!adminStatus) {
            router.push('/');
            return;
        }
        fetchSkillsAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSkillsAndCategories = async () => {
        setLoadingSkills(true);
        setLoadingCategories(true);
        setSkillError(null);
        setCategoryError(null);
        try {
            // Fetch in parallel
            const [skillsData, categoriesData] = await Promise.all([
                api.getSkills(),
                api.getCategories()
            ]);

            // Process Skills
            skillsData.sort((a, b) => { /* ... sort logic ... */
                 const catComp = (a.category?.displayName ?? '').localeCompare(b.category?.displayName ?? '');
                 if (catComp !== 0) return catComp;
                 return a.name.localeCompare(b.name);
            });
            setSkills(skillsData);
            setLoadingSkills(false);

            // Process Categories
            categoriesData.sort((a,b) => (a.order ?? 0) - (b.order ?? 0) || a.displayName.localeCompare(b.displayName)); // Sort by order, then name
            setCategories(categoriesData);
            setLoadingCategories(false);

            // Update default category for skill form if needed
            if (categoriesData.length > 0 && !skillFormData.category) {
                setSkillFormData(prev => ({ ...prev, category: categoriesData[0]._id }));
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            const errorMsg = 'Error loading data. Check console.';
            setSkillError(errorMsg);
            setCategoryError(errorMsg); // Show error for both potentially
            setSkills([]);
            setCategories([]);
            setLoadingSkills(false);
            setLoadingCategories(false);
        }
    };

    // --- Skill Form Handlers (Minor renames for clarity) ---
    const resetSkillForm = () => {
        setSkillFormData({ name: '', category: categories.length > 0 ? categories[0]._id : '' });
        setIsCreatingSkill(false);
        setEditingSkillId(null);
    };
    const handleCreateNewSkill = () => {
        resetSkillForm();
        setIsCreatingSkill(true);
        setEditingSkillId(null);
    };
    const handleEditSkill = (skill: Skill) => {
        setIsCreatingSkill(false);
        setEditingSkillId(skill._id);
        setSkillFormData({ name: skill.name, category: skill.category?._id ?? '' });
    };
    const handleSkillSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skillFormData.category || !skillFormData.name) { /* ... validation ... */ return; }
        setIsSkillSubmitting(true);
        setSkillError(null);
        try {
            const token = getAuthToken(); if (!token) throw new Error('Auth required.');
            const dataToSend = { name: skillFormData.name.trim(), category: skillFormData.category };
            if (editingSkillId) {
                await api.updateSkill(editingSkillId, dataToSend, token);
            } else if (isCreatingSkill) {
                await api.createSkill(dataToSend, token);
            }
            resetSkillForm();
            await fetchSkillsAndCategories(); // Refresh both lists
        } catch (error) {
            console.error('Error saving skill:', error);
            setSkillError(`Failed to save skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        } finally {
            setIsSkillSubmitting(false);
        }
    };
    const handleDeleteSkill = async (id: string) => {
        if (!window.confirm('Delete this skill?')) return;
        setIsSkillSubmitting(true); // Use skill submit state or add delete state
        setSkillError(null);
        try {
            const token = getAuthToken(); if (!token) throw new Error('Auth required.');
            await api.deleteSkill(id, token);
            await fetchSkillsAndCategories(); // Refresh
            if (editingSkillId === id) { resetSkillForm(); }
        } catch (error) {
            console.error('Error deleting skill:', error);
            setSkillError(`Failed to delete skill: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        } finally {
             setIsSkillSubmitting(false);
        }
    };
     const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
         const { name, value } = e.target;
         setSkillFormData(prev => ({ ...prev, [name]: value }));
     };
    const handleCancelSkill = () => resetSkillForm();


    // --- NEW Category Form Handlers ---
    const resetCategoryForm = () => {
        setCategoryFormData({ key: '', displayName: '', order: 0 });
        setIsCreatingCategory(false);
        setEditingCategoryId(null);
        setCategoryError(null);
    };
    const handleCreateNewCategory = () => {
        resetCategoryForm();
        setIsCreatingCategory(true);
        setEditingCategoryId(null);
    };
    const handleEditCategory = (category: Category) => {
        setIsCreatingCategory(false);
        setEditingCategoryId(category._id);
        setCategoryFormData({
            key: category.key, // Keep key for reference, but it won't be sent for update
            displayName: category.displayName,
            order: category.order ?? 0
        });
         setCategoryError(null);
    };
     const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const { name, value } = e.target;
         setCategoryFormData(prev => ({
            ...prev,
            // Ensure order is stored as number
            [name]: name === 'order' ? parseInt(value, 10) || 0 : value
         }));
     };
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
         setCategoryError(null); // Clear previous errors
        // Basic validation
        if (!categoryFormData.displayName.trim()) {
            setCategoryError("Display Name cannot be empty.");
            return;
        }
        if (!editingCategoryId && !categoryFormData.key.trim()) {
            setCategoryError("Key is required for new categories.");
            return;
        }
         // Optional: Key format validation (regex from backend)
         const keyRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
         if (!editingCategoryId && !keyRegex.test(categoryFormData.key.trim())) {
             setCategoryError("Key must be lowercase alphanumeric with hyphens only (e.g., dev-tools).");
             return;
         }

        setIsCategorySubmitting(true);
        try {
            const token = getAuthToken(); if (!token) throw new Error('Auth required.');

            if (editingCategoryId) {
                // Prepare data for update (exclude key)
                const { key, ...updateData } = categoryFormData;
                await api.updateCategory(editingCategoryId, updateData, token);
            } else {
                 // Prepare data for create (include key)
                 const dataToSend = {
                     ...categoryFormData,
                     key: categoryFormData.key.trim().toLowerCase(), // Ensure consistency
                 };
                await api.createCategory(dataToSend, token);
            }
            resetCategoryForm();
            await fetchSkillsAndCategories(); // Refresh both lists
        } catch (error) {
            console.error('Error saving category:', error);
            setCategoryError(`Failed to save category: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        } finally {
            setIsCategorySubmitting(false);
        }
    };
    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Delete this category? Skills using it must be reassigned first.')) return;
        setIsCategorySubmitting(true);
        setCategoryError(null);
        try {
            const token = getAuthToken(); if (!token) throw new Error('Auth required.');
            await api.deleteCategory(id, token);
            await fetchSkillsAndCategories(); // Refresh both lists
            if (editingCategoryId === id) { resetCategoryForm(); }
        } catch (error) {
            console.error('Error deleting category:', error);
            // Display specific error message from backend if possible
            setCategoryError(`Failed to delete category: ${error instanceof Error ? error.message : 'Check console.'}`);
        } finally {
            setIsCategorySubmitting(false);
        }
    };
    const handleCancelCategory = () => resetCategoryForm();


    // --- Render Logic ---
    if (loadingSkills || loadingCategories) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    if (!isAdminUser) return null; // Should be redirected

    // Determine if any form is open
    const isSkillFormOpen = isCreatingSkill || editingSkillId;
    const isCategoryFormOpen = isCreatingCategory || editingCategoryId;


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12"> {/* Added spacing */}

                {/* ================== Skills Section ================== */}
                <section>
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Skills</h1>
                        {/* Show "Add New Skill" only if no forms are open */}
                        {!isSkillFormOpen && !isCategoryFormOpen && (
                            <button onClick={handleCreateNewSkill} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"> Add New Skill </button>
                        )}
                    </div>
                    {skillError && (<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"> {skillError} </div> )}

                    {/* Skill Add/Edit Form */}
                    {isSkillFormOpen && (
                        <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white"> {editingSkillId ? 'Edit Skill' : 'Add New Skill'} </h2>
                            <form onSubmit={handleSkillSubmit} className="space-y-4">
                                {/* Skill Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Skill Name </label>
                                    <input type="text" name="name" value={skillFormData.name} onChange={handleSkillInputChange} required disabled={isSkillSubmitting} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                {/* Category Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Category </label>
                                    <select name="category" value={skillFormData.category} onChange={handleSkillInputChange} required disabled={isSkillSubmitting || categories.length === 0} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" >
                                        <option value="" disabled={skillFormData.category !== ''}>-- Select --</option>
                                        {categories.map((cat) => ( <option key={cat._id} value={cat._id}> {cat.displayName} </option> ))}
                                    </select>
                                    {categories.length === 0 && !loadingCategories && (<p className="text-xs text-red-500 mt-1">No categories found. Add categories below first.</p>)}
                                </div>
                                {/* Buttons */}
                                <div className="flex space-x-4 pt-4">
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isSkillSubmitting}> {isSkillSubmitting ? 'Saving...' : 'Save Skill'} </button>
                                    <button type="button" onClick={handleCancelSkill} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md" disabled={isSkillSubmitting}> Cancel </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Skills List */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white px-6 py-4 border-b border-gray-200 dark:border-gray-700"> Current Skills </h2>
                        {loadingSkills ? ( <div className="p-6 text-center">Loading skills...</div> )
                         : skills.length === 0 ? ( <div className="p-6 text-center text-gray-600 dark:text-gray-400">No skills added yet.</div> )
                         : ( <ul className="divide-y divide-gray-200 dark:divide-gray-700"> {skills.map(skill => ( <li key={skill._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"> <div> <h3 className="text-lg font-medium text-gray-900 dark:text-white">{skill.name}</h3> <p className="text-sm text-gray-500 dark:text-gray-400">{skill.category?.displayName ?? 'Unknown Category'}</p> </div> <div className="flex space-x-3 flex-shrink-0"> <button onClick={() => handleEditSkill(skill)} className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50" disabled={isSkillSubmitting || editingSkillId === skill._id || isCategoryFormOpen}> Edit </button> <button onClick={() => handleDeleteSkill(skill._id)} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50" disabled={isSkillSubmitting || isCategoryFormOpen}> Delete </button> </div> </li> ))} </ul> )}
                    </div>
                </section>

                {/* ================== Categories Section ================== */}
                <section>
                    <div className="mb-8 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
                         {/* Show "Add New Category" only if no forms are open */}
                        {!isSkillFormOpen && !isCategoryFormOpen && (
                            <button onClick={handleCreateNewCategory} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"> Add New Category </button>
                        )}
                    </div>
                     {categoryError && (<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"> {categoryError} </div> )}

                    {/* Category Add/Edit Form */}
                    {isCategoryFormOpen && (
                        <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white"> {editingCategoryId ? 'Edit Category' : 'Add New Category'} </h3>
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                {/* Key Input (Disabled on Edit) */}
                                <div>
                                    <label htmlFor="category-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Key (Internal ID) </label>
                                    <input id="category-key" type="text" name="key" value={categoryFormData.key} onChange={handleCategoryInputChange} required disabled={isCategorySubmitting || !!editingCategoryId} placeholder="e.g., programming, dev-tools" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> Unique, lowercase, use hyphens (cannot be changed after creation). </p>
                                </div>
                                {/* Display Name Input */}
                                <div>
                                    <label htmlFor="category-displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Display Name </label>
                                    <input id="category-displayName" type="text" name="displayName" value={categoryFormData.displayName} onChange={handleCategoryInputChange} required disabled={isCategorySubmitting} placeholder="e.g., Programming, Development Tools" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> How the category appears in the UI. </p>
                                </div>
                                 {/* Order Input */}
                                <div>
                                    <label htmlFor="category-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> Display Order (Optional) </label>
                                    <input id="category-order" type="number" name="order" value={categoryFormData.order} min="0" onChange={handleCategoryInputChange} disabled={isCategorySubmitting} placeholder="0" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" />
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"> Lower numbers appear first in the public list (default is 0). </p>
                                </div>
                                {/* Buttons */}
                                <div className="flex space-x-4 pt-4">
                                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isCategorySubmitting}> {isCategorySubmitting ? 'Saving...' : 'Save Category'} </button>
                                    <button type="button" onClick={handleCancelCategory} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md" disabled={isCategorySubmitting}> Cancel </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Categories List */}
                     <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white px-6 py-4 border-b border-gray-200 dark:border-gray-700"> Current Categories </h3>
                         {loadingCategories ? ( <div className="p-6 text-center">Loading categories...</div> )
                          : categories.length === 0 ? ( <div className="p-6 text-center text-gray-600 dark:text-gray-400">No categories created yet.</div> )
                          : ( <ul className="divide-y divide-gray-200 dark:divide-gray-700"> {categories.map(cat => ( <li key={cat._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"> <div> <h4 className="text-lg font-medium text-gray-900 dark:text-white">{cat.displayName}</h4> <p className="text-sm text-gray-500 dark:text-gray-400">Key: {cat.key} | Order: {cat.order ?? 0}</p> </div> <div className="flex space-x-3 flex-shrink-0"> <button onClick={() => handleEditCategory(cat)} className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50" disabled={isCategorySubmitting || editingCategoryId === cat._id || isSkillFormOpen}> Edit </button> <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50" disabled={isCategorySubmitting || isSkillFormOpen}> Delete </button> </div> </li> ))} </ul> )}
                     </div>
                </section>

            </div>
        </div>
    );
}