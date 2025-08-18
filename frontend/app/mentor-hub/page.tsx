'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import MentorList from '../../components/mentor-hub/MentorList';
import RequestModal from '../../components/mentor-hub/RequestModal';
import { Search, Filter, BookOpen, GraduationCap, Globe, Code, Sparkles, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
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

export default function MentorHubPage() {
  const [mentors, setMentors] = useState<Mentor[]>(mentorsList);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>(mentorsList);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('find'); // 'find' or 'become'
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

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

  const handleRequestMentor = (mentorId: string) => {
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
          <GraduationCap className="h-8 w-8 text-blue-600 dark:text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mentor Hub</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2 ml-11">
          Connect with experienced developers who can help you with your open source journey
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-900/70 rounded-lg border border-gray-200 dark:border-gray-700 p-1 flex gap-1 shadow-lg dark:shadow-lg">
          <button
            className={`px-6 py-3 font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${activeTab === 'find' 
              ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setActiveTab('find')}
          >
            <Search className="h-4 w-4" />
            Find a Mentor
          </button>
          <button
            className={`px-6 py-3 font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${activeTab === 'become' 
              ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
            onClick={() => setActiveTab('become')}
          >
            <GraduationCap className="h-4 w-4" />
            Become a Mentor
          </button>
        </div>
      </div>

      {activeTab === 'find' ? (
        <>
          <div className="bg-blue-50 dark:bg-purple-900/20 border border-blue-200 dark:border-purple-700/30 rounded-lg p-4 mb-8 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-700 dark:text-purple-300 font-medium">How Mentorship Works</p>
              <p className="text-blue-600 dark:text-purple-200 text-sm mt-1">
                Our AI matches you with mentors based on your skills and the issues you're interested in.
                Request help from a mentor, and they'll guide you through the contribution process.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/70 rounded-lg shadow-md dark:shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search mentors or skills..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="text-gray-500 dark:text-gray-400 h-4 w-4" />
                  <select
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 w-full shadow-sm dark:shadow-none"
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
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 w-full sm:w-auto shadow-sm dark:shadow-none"
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

            <MentorList 
              mentors={filteredMentors} 
              isLoading={isLoading} 
              onRequestMentor={handleRequestMentor}
            />
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900/70 rounded-lg shadow-md dark:shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Become a Mentor</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Share your expertise and help others contribute to open source projects. As a mentor, you'll guide developers through their first contributions and help them grow their skills.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Global Impact</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Help developers from around the world contribute to open source projects and make a lasting impact.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sharpen Your Skills</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Teaching others is one of the best ways to deepen your own understanding and expertise.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recognition</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Earn badges, climb the leaderboard, and build your reputation in the open source community.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Networking</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect with talented developers and expand your professional network.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link 
                href="/mentor/apply"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-md transition-colors font-medium flex items-center gap-2 shadow-sm dark:shadow-none"
              >
                <GraduationCap className="h-5 w-5" />
                Apply to Become a Mentor
              </Link>
            </div>
          </div>
        </div>
      )}

      <RequestModal 
        mentor={selectedMentor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}