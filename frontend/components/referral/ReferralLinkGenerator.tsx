import React, { useState } from 'react';
import { Copy, Check, Share2, Twitter, Mail, Linkedin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

type ReferralLinkGeneratorProps = {
  referralCode: string;
  isLoading: boolean;
};

export default function ReferralLinkGenerator({ referralCode, isLoading }: ReferralLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent('🚀 Join me on IssueMatch - the AI-powered platform that matches developers with perfect open source issues! Use my referral link and let\'s contribute together:');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join IssueMatch - Find Your Perfect Open Source Match');
    const body = encodeURIComponent(`Hey there!\n\nI've been using IssueMatch to find open source projects that perfectly match my skills using AI. It's been amazing for discovering meaningful contributions!\n\nI thought you might be interested too. Use my referral link to sign up and we both get rewards:\n${referralLink}\n\nLet's contribute to open source together!\n\nCheers!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 animate-pulse shadow-lg">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/10 to-[#f59e6c]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Referral Link</h3>
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#e88951]/10 to-[#f59e6c]/10 border border-[#e88951]/20 rounded-full px-4 py-2">
            <Share2 className="h-4 w-4 text-[#e88951]" />
            <span className="text-sm font-mono font-semibold text-[#e88951]">{referralCode}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e88951] bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-[#e88951] to-[#f59e6c] hover:from-[#d67840] hover:to-[#e88951] text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy Link
              </>
            )}
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Share your referral link on social media and earn rewards when developers sign up!
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={shareViaTwitter}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#0d1117] hover:bg-gray-200 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-800 font-medium"
            >
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              Twitter
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
            
            <button 
              onClick={shareViaEmail}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#0d1117] hover:bg-gray-200 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-800 font-medium"
            >
              <Mail className="h-4 w-4 text-[#EA4335]" />
              Email
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
            
            <button 
              onClick={shareViaLinkedIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#0d1117] hover:bg-gray-200 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-800 font-medium"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              LinkedIn
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-[#e88951]/5 to-[#f59e6c]/5 border border-[#e88951]/20 rounded-xl">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-[#e88951]">💡 Pro Tip:</span> Personalize your message when sharing! Explain how IssueMatch helped you find meaningful open source contributions.
          </p>
        </div>
      </div>
    </div>
  );
}