'use client';

import { useEffect, useRef, useState } from 'react'; // Import useState
import { Project } from '@/types';
import Image from 'next/image';
import IconExpand from './IconExpand';   
import IconCompress from './IconCompress'; 

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- SIMPLIFIED IMAGE LOGIC ---
  // Directly use the project.images array, defaulting to empty if undefined/null
  const displayImages: string[] = project.images || [];
  // --- END SIMPLIFIED IMAGE LOGIC ---

  const imageSource = displayImages.length > 0
    ? displayImages[currentImageIndex]
    : '/placeholder-project.svg';
  const totalImages = displayImages.length;

  const toggleEnlarge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setIsEnlarged(!isEnlarged);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEnlarged(false);
      }
    };

    if (isEnlarged) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isEnlarged]);

  // --- Dynamic Classes (Keep as is) ---
  const cardWrapperClasses = isEnlarged
    ? 'fixed inset-0 m-auto w-[90vw] max-w-[1000px] h-[85vh] max-h-[750px] z-50 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transition-transform transform scale-100'
    : 'relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform scale-100';

  const imageContainerClasses = isEnlarged
    ? 'relative w-full h-3/5 flex-shrink-0 bg-gray-200 dark:bg-gray-700 group'
    : 'relative w-full pb-[56.25%] bg-gray-100 dark:bg-gray-700 group';

  const contentContainerClasses = isEnlarged
    ? 'p-6 flex flex-col flex-grow overflow-y-auto'
    : 'p-6 flex flex-col flex-grow';

  return (
    <>
      {/* Backdrop */}
      {isEnlarged && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 cursor-pointer"
          onClick={() => setIsEnlarged(false)}
          aria-hidden="true"
        />
      )}

      {/* Card Wrapper */}
      <div ref={cardRef} className={cardWrapperClasses}>
        {/* Enlarge/Shrink Button */}
        <button
          onClick={toggleEnlarge}
          className="absolute top-2 right-2 z-50 p-1.5 bg-gray-600 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isEnlarged ? "Shrink project view" : "Enlarge project view"}
        >
          {isEnlarged ? <IconCompress className="w-5 h-5" /> : <IconExpand className="w-5 h-5" />}
        </button>

        {/* Image Container */}
        <div className={imageContainerClasses}>
          {displayImages.length > 0 ? ( // Check displayImages length
            <Image
              key={currentImageIndex}
              src={imageSource}
              alt={`${project.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain p-2"
              priority={false}
              sizes={isEnlarged ? "90vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            />
           ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No Image Available
            </div>
           )}

           {/* Image Navigation Arrows */}
           {totalImages > 1 && (
             <>
                {/* Previous Button */}
                <button onClick={handlePrevImage} className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-40 text-white p-1.5 rounded-full hover:bg-opacity-60 transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Previous Image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {/* Next Button */}
                <button onClick={handleNextImage} className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-40 text-white p-1.5 rounded-full hover:bg-opacity-60 transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Next Image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                {/* Indicator Dots */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {displayImages.map((_, index) => (<span key={index} className={`block h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} aria-label={`Go to image ${index + 1}`}></span>))}
                </div>
             </>
           )}
        </div>

        {/* Content Container */}
        <div className={contentContainerClasses}>
          {/* Title */}
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex-shrink-0">
            {project.title}
          </h3>
          {/* Description */}
          <p className={`text-gray-600 dark:text-gray-300 text-sm lg:text-base flex-grow ${isEnlarged ? 'mb-4' : 'mb-4'}`}>
            {project.description}
          </p>
          {/* Technologies */}
          <div className="mb-4 flex flex-wrap gap-2 flex-shrink-0">
            {project.technologies.map((tech, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {tech}
              </span>
            ))}
          </div>
          {/* Links */}
          <div className="mt-auto flex space-x-4 flex-shrink-0">
            {project.link1?.url && ( <a href={project.link1.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"> {project.link1.name || 'Link 1'} </a> )}
            {project.link2?.url && ( <a href={project.link2.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"> {project.link2.name || 'Link 2'} </a> )}
          </div>
        </div>
      </div>
    </>
  );
}