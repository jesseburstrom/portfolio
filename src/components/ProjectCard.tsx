'use client';

import { useEffect, useRef, useState } from 'react'; // Import useState
import { Project } from '@/types';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
  // Add isAdmin prop if needed for edit/delete buttons inside expanded view
  // isAdmin?: boolean;
}

export default function ProjectCard({ project /*, isAdmin = false*/ }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Keep for expanded carousel
  const cardRef = useRef<HTMLDivElement>(null);

  // Use only the first image for the thumbnail, or a placeholder
  const thumbnailImageSource = project.images?.[0] || '/placeholder-project.svg'; // Use optional chaining
  const hasThumbnailImage = !!project.images?.[0];

  // Use all images for the expanded view carousel
  const expandedImages: string[] = project.images || [];
  const expandedImageSource = expandedImages.length > 0 ? expandedImages[currentImageIndex] : '/placeholder-project.svg';
  const totalExpandedImages = expandedImages.length;

  // --- Event Handlers ---
  const handleExpand = (e?: React.MouseEvent | React.KeyboardEvent) => {
     // Prevent link navigation if clicking on a link inside the thumbnail
     if (e && (e.target as HTMLElement).tagName === 'A') {
        return;
     }
     e?.preventDefault();
     setIsExpanded(true);
  };

  const handleShrink = (e?: React.MouseEvent | React.KeyboardEvent) => {
     e?.stopPropagation(); // Prevent event bubbling if needed
     setIsExpanded(false);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalExpandedImages);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalExpandedImages) % totalExpandedImages);
  };

  // Close expanded view with Escape key or click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleShrink();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the expanded card element
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleShrink();
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside); // Use mousedown to catch clicks earlier

    // Body overflow (optional, maybe not needed if not full modal)
    // document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      // document.body.style.overflow = '';
    };
  }, [isExpanded]); // Rerun effect when isExpanded changes

  // --- Component Structure ---

  if (isExpanded) {
    // --- EXPANDED VIEW ---
    return (
      <>
        {/* Semi-transparent backdrop (Optional, but helps focus) */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleShrink}
          aria-hidden="true"
        />

        {/* Expanded Card Container - Positioned Centered */}
        <div
          ref={cardRef} // Ref for click outside detection
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-3xl h-[85vh] max-h-[700px] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          aria-modal="true"
          role="dialog"
          aria-labelledby={`project-title-${project._id}`}
        >
          {/* Close Button */}
          <button
            onClick={handleShrink}
            className="absolute top-3 right-3 z-50 p-1.5 bg-gray-500 bg-opacity-60 text-white rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close project details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Area (with Carousel if multiple images) */}
          <div className="relative w-full h-2/5 flex-shrink-0 bg-gray-100 dark:bg-gray-700 group">
             {expandedImages.length > 0 ? (
                <Image
                  key={currentImageIndex} // Force re-render on index change
                  src={expandedImageSource}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain p-2" // Use contain to see full image
                  priority={true} // Prioritize loading the main image
                  sizes="(max-width: 1024px) 90vw, 896px" // Example sizes for large modal
                />
             ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">No Image Available</div>
             )}
            {/* Carousel Controls */}
            {totalExpandedImages > 1 && (
              <>
                {/* Prev Button */}
                <button onClick={handlePrevImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-40 text-white p-1.5 rounded-full hover:bg-opacity-60 transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Previous Image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                 {/* Next Button */}
                 <button onClick={handleNextImage} className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-40 text-white p-1.5 rounded-full hover:bg-opacity-60 transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Next Image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {expandedImages.map((_, index) => (<span key={index} className={`block h-2 w-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} aria-label={`Go to image ${index + 1}`}></span>))}
                </div>
              </>
            )}
          </div>

          {/* Content Area (Scrollable) */}
          <div className="p-5 md:p-6 flex-grow overflow-y-auto">
            <h3 id={`project-title-${project._id}`} className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {project.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-base leading-relaxed">
              {project.description} {/* Full description */}
            </p>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Technologies Used:</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
             {/* Links */}
             {(project.link1?.url || project.link2?.url) && (
               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Links:</h4>
                 <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {project.link1?.url && (<a href={project.link1.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"> {project.link1.name || 'Live Demo'} </a>)}
                    {project.link2?.url && (<a href={project.link2.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"> {project.link2.name || 'GitHub'} </a>)}
                  </div>
               </div>
             )}
              {/* TODO: Add Admin Edit/Delete buttons here if isAdmin prop is true */}
          </div>
        </div>
      </>
    );
  } else {
    // --- THUMBNAIL VIEW ---
    return (
      <button // Use button for accessibility and click handling
        onClick={handleExpand}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExpand(e); }}
        className="group relative w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer text-left border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label={`View details for ${project.title}`}
      >
        {/* Thumbnail Image */}
        <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
          {hasThumbnailImage ? (
            <Image
              src={thumbnailImageSource}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300" // Cover and slight zoom on hover
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adjust sizes as needed
              priority={false} // Lower priority for thumbnails
            />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No Image</div>
          )}
           {/* Optional: Add a subtle overlay on hover */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Thumbnail Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          {/* Thumbnail Description (use if available) */}
          {project.thumbnailDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
              {project.thumbnailDescription}
            </p>
          )}
          {/* Technologies (Show fewer or smaller) */}
          <div className="mt-auto pt-2 flex-shrink-0"> {/* Push tech to bottom */}
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map((tech, index) => ( // Limit shown technologies
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {tech}
                </span>
              ))}
               {project.technologies.length > 4 && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">...</span>
               )}
            </div>
          </div>
        </div>
      </button>
    );
  }
}