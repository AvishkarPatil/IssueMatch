'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import MentorGalaxy from '../../components/mentor-hub/MentorGalaxy';
import MentorGalaxyMobile from '../../components/mentor-hub/MentorGalaxyMobile';
import RequestModal from '../../components/mentor-hub/RequestModal';
import { Search, Filter, GraduationCap, Clock, Code, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { mentorsList } from '../../lib/dummyData';

type Mentor = {
  id: string;
  name: string;
  avatarUrl: string;
  githubUrl: string;
  skills: string[];
  rating: number;
  bio: string;
  availability: 'available' | 'busy' | 'unavailable';
  experience?: number;
  timezone?: string;
  languages?: string[];
  achievements?: string[];
};

export default function MentorGalaxyPage() {
  const [mentors, setMentors] = useState<Mentor[]>(mentorsList);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>(mentorsList);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filter mentors when search term or filters change
  useEffect(() => {
    if (mentors.length === 0) return;
    
    const filtered = mentors.filter(mentor => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by availability
      const matchesAvailability = availabilityFilter === 'all' || 
        mentor.availability === availabilityFilter;
      
      // Filter by skill
      const matchesSkill = skillFilter === 'all' || 
        mentor.skills.includes(skillFilter);
      
      return matchesSearch && matchesAvailability && matchesSkill;
    });
    
    setFilteredMentors(filtered);
  }, [searchTerm, availabilityFilter, skillFilter, mentors]);

  // Get unique skills from all mentors for the filter dropdown
  const allSkills = Array.from(new Set(mentors.flatMap(mentor => mentor.skills))).sort();

  const handleSelectMentor = (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      setIsModalOpen(true);
    }
  };

  const handleSubmitRequest = async (mentorId: string, message: string, issueLink?: string, preferredTime?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Mentorship request sent successfully!');
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      toast.error('Failed to send mentorship request. Please try again.');
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-100">Mentor Network Galaxy</h1>
        </div>
        <p className="text-gray-400 mt-2 ml-11">
          Explore our network of mentors and find the perfect match for your skills
        </p>
      </div>

      <div className="bg-gray-900/70 rounded-lg shadow-md border border-gray-700 p-6 mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search mentors or skills..."
              className="pl-10 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-gray-400 h-4 w-4" />
              <select
                className="border border-gray-700 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 w-full"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            
            <select
              className="border border-gray-700 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 w-full sm:w-auto"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="all">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-300">Busy</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-300">Unavailable</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <div className="w-3 h-3 border border-dashed border-purple-400 rounded-full"></div>
              <span className="text-gray-300">Shared Skills</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full border border-purple-800/50 text-xs">
              <Users className="h-3 w-3" />
              <span>Active Mentors: {filteredMentors.filter(m => m.availability === 'available').length}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full border border-purple-800/50 text-xs">
              <Star className="h-3 w-3" />
              <span>Avg Rating: {(mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full border border-purple-800/50 text-xs">
              <Code className="h-3 w-3" />
              <span>Skills: {allSkills.length}</span>
            </div>
          </div>
        </div>

        {isMobile ? (
          <MentorGalaxyMobile 
            mentors={filteredMentors} 
            isLoading={isLoading} 
            onSelectMentor={handleSelectMentor}
          />
        ) : (
          <MentorGalaxy 
            mentors={filteredMentors} 
            isLoading={isLoading} 
            onSelectMentor={handleSelectMentor}
          />
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-3">
            Click on a mentor node to view their profile and request mentorship
          </p>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm">
            Find Perfect Mentor Match
          </button>
        </div>
      </div>

      <RequestModal 
        mentor={selectedMentor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}