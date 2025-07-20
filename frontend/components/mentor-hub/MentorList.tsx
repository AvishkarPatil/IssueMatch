import React from 'react';
import { ExternalLink, MessageCircle, Star, Calendar, Clock, Award, Code } from 'lucide-react';
import Link from 'next/link';

type Mentor = {
  id: string;
  name: string;
  avatarUrl: string;
  githubUrl: string;
  skills: string[];
  rating: number;
  bio: string;
  availability: 'available' | 'busy' | 'unavailable';
  experience?: number; // Years of experience
  timezone?: string; // Mentor's timezone
  languages?: string[]; // Programming languages
  achievements?: string[]; // Special achievements
};

type MentorListProps = {
  mentors: Mentor[];
  isLoading: boolean;
  onRequestMentor: (mentorId: string) => void;
};

export default function MentorList({ mentors, isLoading, onRequestMentor }: MentorListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-800/50 h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No mentors found matching your criteria.</p>
      </div>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-900/30 text-green-400 border border-green-700/30';
      case 'busy':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30';
      case 'unavailable':
        return 'bg-red-900/30 text-red-400 border border-red-700/30';
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-700';
    }
  };

  // Add sample data for new fields if they don't exist
  const enhancedMentors = mentors.map(mentor => ({
    ...mentor,
    experience: mentor.experience || Math.floor(Math.random() * 10) + 1,
    timezone: mentor.timezone || ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+5', 'UTC+8'][Math.floor(Math.random() * 6)],
    languages: mentor.languages || mentor.skills.filter(s => ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'].includes(s)),
    achievements: mentor.achievements || []
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enhancedMentors.map((mentor) => (
        <div 
          key={mentor.id}
          className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-purple-700/50"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={mentor.avatarUrl} 
                alt={mentor.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-100">{mentor.name}</h3>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400" />
                  <span>{mentor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{mentor.bio}</p>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span>{mentor.languages?.slice(0, 2).join(', ') || 'Various'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{mentor.experience} years</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{mentor.timezone}</span>
              </div>
              {mentor.achievements?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>{mentor.achievements[0]}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {mentor.skills.slice(0, 4).map((skill, i) => (
                <span 
                  key={i} 
                  className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
                >
                  {skill}
                </span>
              ))}
              {mentor.skills.length > 4 && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  +{mentor.skills.length - 4} more
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(mentor.availability)}`}>
                {mentor.availability.charAt(0).toUpperCase() + mentor.availability.slice(1)}
              </span>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={mentor.githubUrl}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                
                <button
                  onClick={() => onRequestMentor(mentor.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mentor.availability === 'unavailable'}
                >
                  <MessageCircle className="h-4 w-4" />
                  Request Help
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}