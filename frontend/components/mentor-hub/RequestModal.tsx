import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, HelpCircle, Code } from 'lucide-react';

type Mentor = {
  id: string;
  name: string;
  avatarUrl: string;
  skills?: string[];
  timezone?: string;
};

type RequestModalProps = {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mentorId: string, message: string, issueLink?: string, preferredTime?: string) => Promise<void>;
};

export default function RequestModal({ mentor, isOpen, onClose, onSubmit }: RequestModalProps) {
  const [message, setMessage] = useState('');
  const [issueLink, setIssueLink] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'schedule'

  if (!isOpen || !mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(mentor.id, message, issueLink, preferredTime);
      onClose();
      setMessage('');
      setIssueLink('');
      setPreferredTime('');
    } catch (error) {
      console.error('Error submitting mentor request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl dark:shadow-none w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Mentorship</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-[#0d1117] rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-gray-800">
            <img 
              src={mentor.avatarUrl} 
              alt={mentor.name} 
              className="w-12 h-12 rounded-full border-2 border-[#e88951]/30"
            />
            <div>
              <span className="font-semibold text-gray-900 dark:text-white block">{mentor.name}</span>
              {mentor.timezone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="h-3.5 w-3.5 text-[#e88951]" />
                  <span>{mentor.timezone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-[#e88951] border-b-2 border-[#e88951]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('details')}
            >
              Request Details
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'text-[#e88951] border-b-2 border-[#e88951]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {activeTab === 'details' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </div>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                    placeholder="Explain what you need help with..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="issueLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      <span>GitHub Issue Link (Optional)</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="issueLink"
                    className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                    placeholder="https://github.com/org/repo/issues/123"
                    value={issueLink}
                    onChange={(e) => setIssueLink(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Preferred Meeting Time</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="preferredTime"
                    className="w-full border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#e88951] text-gray-900 dark:text-gray-200 shadow-sm"
                    placeholder="E.g., Weekdays after 6pm EST"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  />
                </div>
                
                <div className="p-4 bg-[#e88951]/10 dark:bg-[#e88951]/20 rounded-xl border border-[#e88951]/30 mb-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-[#e88951] mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      Mentors will try to accommodate your schedule, but availability may vary. 
                      You'll be able to coordinate specific times after your request is accepted.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0d1117] transition-colors font-medium shadow-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#e88951] text-white rounded-full hover:bg-[#d67840] transition-all flex items-center justify-center font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}