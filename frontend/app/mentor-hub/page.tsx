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
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-32 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-[#e88951]" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951]">
              Mentor Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with experienced developers and accelerate your open source journey
          </p>
        </div>

      <div className="flex justify-center mb-12">
        <div className="bg-white dark:bg-[#161b22] rounded-full border border-gray-200 dark:border-gray-800 p-1.5 flex gap-2 shadow-lg">
          <button
            className={`px-8 py-3 font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${activeTab === 'find' 
              ? 'bg-[#e88951] text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0d1117]'}`}
            onClick={() => setActiveTab('find')}
          >
            <Search className="h-4 w-4" />
            Find a Mentor
          </button>
          <button
            className={`px-8 py-3 font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${activeTab === 'become' 
              ? 'bg-[#e88951] text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0d1117]'}`}
            onClick={() => setActiveTab('become')}
          >
            <GraduationCap className="h-4 w-4" />
            Become a Mentor
          </button>
        </div>
      </div>

      {activeTab === 'find' ? (
        <>
          <div className="bg-[#e88951]/10 dark:bg-[#e88951]/20 border border-[#e88951]/30 rounded-xl p-5 mb-8 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-[#e88951] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-900 dark:text-white font-semibold mb-1">How Mentorship Works</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Our AI matches you with mentors based on your skills and the issues you're interested in.
                Request help from a mentor, and they'll guide you through the contribution process.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search mentors or skills..."
                  className="pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="text-gray-500 dark:text-gray-400 h-4 w-4" />
                  <select
                    className="border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 w-full shadow-sm"
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
                  className="border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 w-full sm:w-auto shadow-sm"
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
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-lg dark:shadow-none border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">Become a Mentor</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-center">
              Share your expertise and help others contribute to open source projects
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="group bg-gray-50 dark:bg-[#0d1117] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#e88951] dark:hover:border-[#e88951] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#e88951]/10 dark:bg-[#e88951]/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-[#e88951]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global Impact</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm ml-13">
                  Help developers worldwide contribute to open source and make a lasting impact
                </p>
              </div>
              
              <div className="group bg-gray-50 dark:bg-[#0d1117] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#e88951] dark:hover:border-[#e88951] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#e88951]/10 dark:bg-[#e88951]/20 flex items-center justify-center">
                    <Code className="h-5 w-5 text-[#e88951]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sharpen Skills</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm ml-13">
                  Teaching others deepens your own understanding and expertise
                </p>
              </div>
              
              <div className="group bg-gray-50 dark:bg-[#0d1117] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#e88951] dark:hover:border-[#e88951] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#e88951]/10 dark:bg-[#e88951]/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#e88951]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recognition</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm ml-13">
                  Earn badges and build your reputation in the community
                </p>
              </div>
              
              <div className="group bg-gray-50 dark:bg-[#0d1117] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#e88951] dark:hover:border-[#e88951] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#e88951]/10 dark:bg-[#e88951]/20 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-[#e88951]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Networking</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm ml-13">
                  Connect with talented developers and expand your network
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link 
                href="/mentor/apply"
                className="px-8 py-4 bg-[#e88951] hover:bg-[#d67840] text-white rounded-full transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
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
  </div>
  );
}