import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

type MentorNode = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  rating: number;
  availability: string;
  bio: string;
};

type MentorGalaxyMobileProps = {
  mentors: MentorNode[];
  onSelectMentor: (mentorId: string) => void;
  isLoading: boolean;
};

export default function MentorGalaxyMobile({ mentors, onSelectMentor, isLoading }: MentorGalaxyMobileProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-900/30 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-900/30 rounded-lg">
        <p className="text-gray-400">No mentors found matching your criteria.</p>
      </div>
    );
  }

  const activeMentor = mentors[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mentors.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-[400px] bg-gray-900/30 rounded-lg border border-gray-700 overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-xs">
          <div className="relative">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-sm text-gray-400">
              {activeIndex + 1} of {mentors.length}
            </div>
            
            <div className="bg-gray-800/80 rounded-lg p-6 backdrop-blur-sm border border-gray-700 shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={activeMentor.avatarUrl} 
                    alt={activeMentor.name} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${getAvailabilityColor(activeMentor.availability)} border-2 border-gray-800`}></div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-white">{activeMentor.name}</h3>
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400" />
                  <span>{activeMentor.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{activeMentor.bio}</p>
              
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {activeMentor.skills.slice(0, 3).map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/50"
                  >
                    {skill}
                  </span>
                ))}
                {activeMentor.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    +{activeMentor.skills.length - 3} more
                  </span>
                )}
              </div>
              
              <button
                onClick={() => onSelectMentor(activeMentor.id)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
                disabled={activeMentor.availability === 'unavailable'}
              >
                Request Mentorship
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handlePrev}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/80 p-2 rounded-full text-white hover:bg-gray-700/80 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/80 p-2 rounded-full text-white hover:bg-gray-700/80 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}