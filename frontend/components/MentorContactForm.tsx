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
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
      const docRef = await addDoc(collection(db, 'mentorRequests'), {
        issue_id: issueId,
        name: name,
        help_needed: helpType,
        created_at: serverTimestamp(),
        is_connected: false
      });

      setRequestId(docRef.id);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error connecting to mentor:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center px-4 py-12">
      <div className="text-center space-y-8 w-full max-w-lg">
        <div className="relative">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-[#5eead4] dark:to-[#a21caf] tracking-tight">
            <GraduationCap className="inline-block mr-3 -mt-1" /> Connect with a Mentor
          </h2>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-md bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-[#5eead4] dark:to-[#a21caf] opacity-20 animate-pulse -z-10"></div>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#161b22] p-10 rounded-lg shadow-lg dark:shadow-lg border border-gray-200 dark:border-[#30363d] space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-left text-gray-700 dark:text-gray-400 mb-2 text-lg">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#5eead4] focus:outline-none text-lg shadow-sm dark:shadow-none"
              />
            </div>

            <div>
              <label htmlFor="issueId" className="block text-left text-gray-700 dark:text-gray-400 mb-2 text-lg">
                Issue ID
              </label>
              <div className="flex items-center relative">
                <GitBranch className="absolute left-3 text-gray-500" size={18} />
                <input
                  type="text"
                  id="issueId"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#5eead4] focus:outline-none text-lg shadow-sm dark:shadow-none"
                  readOnly={!!searchParams.get('issueID')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="helpType" className="block text-left text-gray-700 dark:text-gray-400 mb-2 text-lg">
                Area of Guidance Needed
              </label>
              <div className="flex items-center relative">
                <Lightbulb className="absolute left-3 text-gray-500" size={18} />
                <textarea
                  id="helpType"
                  value={helpType}
                  onChange={(e) => setHelpType(e.target.value)}
                  required
                  placeholder="Describe what you're struggling with and what kind of mentorship you're looking for..."
                  className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#5eead4] focus:outline-none text-lg min-h-[120px] shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-[#6366f1] dark:to-[#a855f7] text-white font-semibold py-3 rounded-md hover:brightness-110 transition duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#5eead4] focus:outline-none ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              } text-lg mt-4 shadow-sm dark:shadow-none`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Connecting...
                </span>
              ) : (
                'Connect Mentor'
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-[#161b22] p-10 rounded-lg shadow-lg dark:shadow-lg border border-gray-200 dark:border-[#30363d] space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mentorship Request Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A mentor will review your request and reach out to you soon.
              </p>
              <div className="bg-gray-50 dark:bg-[#0d1117] p-4 rounded-md border border-gray-200 dark:border-[#30363d] w-full mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Your Request ID:</p>
                <p className="text-blue-600 dark:text-[#5eead4] font-mono font-medium break-all">{requestId}</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Please save this ID for reference. You can use it to check the status of your request.
              </p>
              <Link
                href="/"
                className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-[#6366f1] dark:to-[#a855f7] text-white font-semibold py-3 px-6 rounded-md hover:brightness-110 transition duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#5eead4] focus:outline-none shadow-sm dark:shadow-none"
              >
                <Home className="mr-2" size={18} />
                Go Home
              </Link>
            </div>
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-500 text-sm">Let's learn and grow together.</p>
      </div>
    </div>
  );
}
