'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  GitBranch,
  GraduationCap,
  Loader2,
  CheckCircle,
  Home
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export function MentorConnectForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [issueId, setIssueId] = useState('');
  const [helpType, setHelpType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');

  useEffect(() => {
    const issueIDFromQuery = searchParams.get('issueID');
    if (issueIDFromQuery) {
      setIssueId(issueIDFromQuery);
    }

    setTimeout(() => {
      setName('GitHub User');
    }, 300);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentor/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mentorId: issueId,
          message: `${name} needs help with: ${helpType}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      const data = await response.json();
      setRequestId(data.id);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error connecting to mentor:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 py-12 pt-32 relative overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="text-center space-y-8 w-full max-w-lg relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-[#e88951]" />
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951]">
              Connect with a Mentor
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Get expert guidance for your open source journey</p>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#161b22] p-10 rounded-2xl shadow-2xl dark:shadow-none border border-gray-200 dark:border-gray-800 space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-left text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e88951] focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="issueId" className="block text-left text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Issue ID
              </label>
              <div className="flex items-center relative">
                <GitBranch className="absolute left-4 text-[#e88951]" size={18} />
                <input
                  type="text"
                  id="issueId"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-12 bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e88951] focus:outline-none shadow-sm"
                  readOnly={!!searchParams.get('issueID')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="helpType" className="block text-left text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Area of Guidance Needed
              </label>
              <div className="flex items-start relative">
                <Lightbulb className="absolute left-4 top-4 text-[#e88951]" size={18} />
                <textarea
                  id="helpType"
                  value={helpType}
                  onChange={(e) => setHelpType(e.target.value)}
                  required
                  placeholder="Describe what you're struggling with and what kind of mentorship you're looking for..."
                  className="w-full px-4 py-3 pl-12 bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e88951] focus:outline-none min-h-[120px] shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full bg-[#e88951] text-white font-semibold py-3 rounded-full hover:bg-[#d67840] transition-all focus:ring-2 focus:ring-[#e88951] focus:outline-none ${
                isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-105'
              } mt-6 shadow-lg hover:shadow-xl`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Connecting...
                </span>
              ) : (
                'Connect with Mentor'
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-[#161b22] p-10 rounded-2xl shadow-2xl dark:shadow-none border border-gray-200 dark:border-gray-800 space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mentorship Request Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                A mentor will review your request and reach out to you soon.
              </p>
              <div className="bg-gray-50 dark:bg-[#0d1117] p-5 rounded-xl border border-gray-200 dark:border-gray-800 w-full mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Request ID:</p>
                <p className="text-[#e88951] font-mono font-semibold break-all text-lg">{requestId}</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Please save this ID for reference. You can use it to check the status of your request.
              </p>
              <Link
                href="/"
                className="flex items-center justify-center bg-[#e88951] hover:bg-[#d67840] text-white font-semibold py-3 px-8 rounded-full transition-all focus:ring-2 focus:ring-[#e88951] focus:outline-none shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Home className="mr-2" size={18} />
                Go Home
              </Link>
            </div>
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-500 text-sm">Let's learn and grow together 🚀</p>
      </div>
    </div>
  );
}
