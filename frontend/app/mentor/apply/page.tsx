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
        userId: user.uid,
        name: user.displayName,
        email: user.email,
        avatarUrl: user.photoURL,
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link 
        href="/mentor-hub" 
        className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Mentor Hub
      </Link>
      
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold text-gray-100">Become a Mentor</h1>
      </div>
      
      <div className="bg-gray-900/70 rounded-lg shadow-md border border-gray-700 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                Bio (Tell us about yourself)
              </label>
              <textarea
                id="bio"
                rows={4}
                className="w-full border border-gray-700 bg-gray-800 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                placeholder="Share your background, expertise, and what you're passionate about..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Skills (Programming languages, frameworks, tools)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <div 
                    key={skill} 
                    className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full border border-purple-800/50"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      className="text-purple-300 hover:text-purple-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 border border-gray-700 bg-gray-800 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 rounded-r-md flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  className="w-full border border-gray-700 bg-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
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
                <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  min="0"
                  max="50"
                  className="w-full border border-gray-700 bg-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="githubProjects" className="block text-sm font-medium text-gray-300 mb-1">
                Notable GitHub Projects or Contributions
              </label>
              <textarea
                id="githubProjects"
                rows={3}
                className="w-full border border-gray-700 bg-gray-800 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                placeholder="List your notable projects or contributions (URLs preferred)"
                value={githubProjects}
                onChange={(e) => setGithubProjects(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-300 mb-1">
                Why do you want to be a mentor?
              </label>
              <textarea
                id="motivation"
                rows={3}
                className="w-full border border-gray-700 bg-gray-800 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                placeholder="Tell us why you want to mentor others and what you hope to achieve"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}