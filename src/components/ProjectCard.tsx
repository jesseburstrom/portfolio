import { Project } from '@/types';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Prioritize imageData (uploaded image) over imageUrl
  const imageSource = project.imageData || project.imageUrl || '/placeholder-project.svg';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative w-full pb-[56.25%] bg-gray-50 dark:bg-gray-900"> {/* Aspect ratio container */}
        <Image
          src={imageSource}
          alt={project.title}
          fill
          className="object-contain p-2" // Use contain to show whole image
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow"> {/* Use flex-grow to push links down */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm flex-grow"> {/* Allow description to grow */}
          {project.description}
        </p>

        {/* Technologies */}
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links - Updated */}
        <div className="mt-auto flex space-x-4"> {/* Use mt-auto to push to bottom */}
          {project.link1?.url && (
            <a
              href={project.link1.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              {project.link1.name || 'Link 1'} {/* Use stored name, fallback */}
            </a>
          )}
          {project.link2?.url && (
            <a
              href={project.link2.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              {project.link2.name || 'Link 2'} {/* Use stored name, fallback */}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}