import React, { useState } from 'react';
import { Copy, Check, Share2, Twitter, Mail, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

type ReferralLinkGeneratorProps = {
  referralCode: string;
  isLoading: boolean;
};

export default function ReferralLinkGenerator({ referralCode, isLoading }: ReferralLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent('Join me on IssueMatch to find open source projects that match your skills! Use my referral link:');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on IssueMatch');
    const body = encodeURIComponent(`Hey,\n\nI've been using IssueMatch to find open source projects that match my skills. I thought you might be interested too!\n\nUse my referral link to sign up: ${referralLink}\n\nCheers!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/70 rounded-lg border border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-800 rounded mb-4"></div>
        <div className="h-10 bg-gray-800 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-lg border border-gray-700 p-6 shadow-md backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Your Referral Link</h3>
      
      <div className="flex items-center mb-6">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 p-2 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-gray-200"
        />
        <button
          onClick={copyToClipboard}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition-colors flex items-center"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-3">
          Share this link with friends to earn points when they sign up!
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={shareViaTwitter}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors border border-gray-700"
          >
            <Twitter className="h-4 w-4 text-blue-400" />
            Twitter
          </button>
          
          <button 
            onClick={shareViaEmail}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors border border-gray-700"
          >
            <Mail className="h-4 w-4 text-green-400" />
            Email
          </button>
          
          <button 
            onClick={shareViaLinkedIn}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors border border-gray-700"
          >
            <Linkedin className="h-4 w-4 text-blue-500" />
            LinkedIn
          </button>
        </div>
      </div>
      
      <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-md">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-purple-400" />
          <p className="text-sm font-medium text-purple-300">
            Your referral code: <span className="font-mono bg-purple-900/30 px-2 py-0.5 rounded">{referralCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
}