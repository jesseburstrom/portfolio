import type { AboutMe } from '@/types';
import Link from 'next/link';

export default function AboutSection({ about }: { about: AboutMe }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{about.name}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{about.title}</p>
          
          {/* Image under title */}
          {(about.imageData || about.imageUrl) && (
            <div className="mt-4 flex justify-center">
              <img
                src={about.imageData || about.imageUrl}
                alt={about.name}
                className="max-w-xs h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            {about.bio}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{about.location}</span>
          </div>
          {about.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${about.phone}`} className="hover:text-blue-600">
                {about.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${about.email}`} className="hover:text-blue-600">
              {about.email}
            </a>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          {about.socialLinks.github && (
            <Link
              href={about.socialLinks.github}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              GitHub
            </Link>
          )}
          {about.socialLinks.linkedin && (
            <Link
              href={about.socialLinks.linkedin}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              LinkedIn
            </Link>
          )}
          {about.socialLinks.twitter && (
            <Link
              href={about.socialLinks.twitter}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              Twitter
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
