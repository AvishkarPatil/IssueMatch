'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { GraduationCap, ChevronLeft, Upload, Trash2, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

export default function MentorApplicationPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [timezone, setTimezone] = useState('');
  const [experience, setExperience] = useState('');
  const [githubProjects, setGithubProjects] = useState('');
  const [motivation, setMotivation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 
    'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 
    'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];
  
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to apply');
      return;
    }
    
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new mentor application in Firestore
      await addDoc(collection(db, 'mentor_applications'), {
        userId: user.id,
        name: user.name || user.login,
        email: user.login, // Using GitHub username as email
        avatarUrl: user.avatar_url,
        bio,
        skills,
        timezone,
        experience: parseInt(experience) || 0,
        githubProjects,
        motivation,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast.success('Application submitted successfully!');
      router.push('/mentor-hub');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl pt-32 relative z-10">
        <Link 
          href="/mentor-hub" 
          className="inline-flex items-center text-[#e88951] hover:text-[#d67840] mb-8 font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Mentor Hub
        </Link>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-[#e88951]" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951]">Become a Mentor</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Share your expertise and help others grow</p>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl dark:shadow-none border border-gray-200 dark:border-gray-800 p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio (Tell us about yourself)
              </label>
              <textarea
                id="bio"
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                placeholder="Share your background, expertise, and what you're passionate about..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skills (Programming languages, frameworks, tools)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <div 
                    key={skill} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#0d1117] text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-800"
                  >
                    <span className="text-sm">{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      className="text-[#e88951] hover:text-[#d67840] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-l-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-[#e88951] hover:bg-[#d67840] text-white px-4 rounded-r-xl flex items-center shadow-md transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                >
                  <option value="">Select your timezone</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  min="0"
                  max="50"
                  className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="githubProjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notable GitHub Projects or Contributions
              </label>
              <textarea
                id="githubProjects"
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                placeholder="List your notable projects or contributions (URLs preferred)"
                value={githubProjects}
                onChange={(e) => setGithubProjects(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Why do you want to be a mentor?
              </label>
              <textarea
                id="motivation"
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                placeholder="Tell us why you want to mentor others and what you hope to achieve"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-[#e88951] hover:bg-[#d67840] text-white rounded-full transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}