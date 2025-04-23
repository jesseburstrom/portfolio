// src/components/TechnicalSkillsList.tsx
'use client'; // Add if not present, needed for useMemo

import { Skill } from '@/types';
import { useMemo } from 'react';

interface TechnicalSkillsListProps {
  skills: Skill[];
}

// Helper function to capitalize words (e.g., "tools & platforms" -> "Tools & Platforms")
function capitalizeWords(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}


export default function TechnicalSkillsList({ skills }: TechnicalSkillsListProps) {
    const groupedSkills = useMemo(() => {
      return skills.reduce((acc, skill) => {
         // Use category ID or key for grouping, displayName for display
         const categoryId = skill.category?._id ?? 'unknown'; // Group by ID
         const categoryName = skill.category?.displayName ?? 'Other'; // Display name
  
         if (!acc[categoryId]) {
             acc[categoryId] = {
                 displayName: categoryName,
                 order: skill.category?.order ?? 999, // Use order for sorting categories
                 skills: []
             };
         }
         acc[categoryId].skills.push(skill.name);
         acc[categoryId].skills.sort(); // Sort skill names
         return acc;
      }, {} as Record<string, { displayName: string; order: number; skills: string[] }>);
    }, [skills]);
  
    // Sort categories based on the order field, then displayName
    const sortedCategories = useMemo(() => {
        return Object.entries(groupedSkills)
            .sort(([, catA], [, catB]) => {
                const orderDiff = catA.order - catB.order;
                if (orderDiff !== 0) return orderDiff;
                return catA.displayName.localeCompare(catB.displayName);
            })
            .map(([id]) => id); // Return only the IDs in sorted order
    }, [groupedSkills]);
  
  
    if (skills.length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No technical skills listed.</p>;
    }
  
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Technical Skills
        </h2>
        <div className="space-y-4">
           {/* Map over sorted category IDs */}
          {sortedCategories.map((categoryId) => {
              const categoryData = groupedSkills[categoryId];
              // Skip rendering if somehow category data is missing (robustness)
              if (!categoryData) return null;
  
              return (
                <div key={categoryId}>
                  <ul className="flex flex-wrap items-start gap-x-4 gap-y-1"> {/* Changed items-center to items-start */}
                    <li className="font-semibold text-gray-800 dark:text-gray-200 w-full sm:w-auto mb-1 sm:mb-0 pt-1 sm:pt-0 flex-shrink-0 after:content-[':'] after:ml-1">
                       {/* Display the category name */}
                       {categoryData.displayName}
                    </li>
                    <li className="flex flex-wrap gap-x-3 gap-y-1 text-gray-700 dark:text-gray-300 flex-1 min-w-0"> {/* Added flex-1 and min-w-0 for better wrapping */}
                      {categoryData.skills.map((skillName, index) => (
                        <span key={skillName} className="whitespace-nowrap"> {/* Prevent awkward breaks in names */}
                          {skillName}
                          {index < categoryData.skills.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </li>
                  </ul>
                </div>
              );
          })}
        </div>
      </div>
    );
}
