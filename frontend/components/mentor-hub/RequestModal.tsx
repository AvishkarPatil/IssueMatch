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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request Mentorship</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={mentor.avatarUrl} 
              alt={mentor.name} 
              className="w-10 h-10 rounded-full border-2 border-blue-500/30 dark:border-purple-500/30"
            />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">{mentor.name}</span>
              {mentor.timezone && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{mentor.timezone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'text-blue-600 dark:text-purple-400 border-b-2 border-blue-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('details')}
            >
              Request Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'text-blue-600 dark:text-purple-400 border-b-2 border-blue-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
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
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none"
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
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none"
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
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none"
                    placeholder="E.g., Weekdays after 6pm EST"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Mentors will try to accommodate your schedule, but availability may vary. 
                      You'll be able to coordinate specific times after your request is accepted.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm dark:shadow-none"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-purple-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-purple-700 transition-colors flex items-center justify-center shadow-sm dark:shadow-none"
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