'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import ReferralLinkGenerator from '../../components/referral/ReferralLinkGenerator';
import ReferralStats from '../../components/referral/ReferralStats';
import { Share2, Users, Gift, Award } from 'lucide-react';
import { referralStats } from '../../lib/dummyData';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState(referralStats.referralCode);
  const [totalReferrals, setTotalReferrals] = useState(referralStats.totalReferrals);
  const [successfulReferrals, setSuccessfulReferrals] = useState(referralStats.successfulReferrals);
  const [pointsEarned, setPointsEarned] = useState(referralStats.pointsEarned);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Share2 className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-100">Referral Program</h1>
        </div>
        <p className="text-gray-400 mt-2 ml-11">
          Invite friends to join IssueMatch and earn rewards
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ReferralLinkGenerator 
          referralCode={referralCode} 
          isLoading={isLoading} 
        />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Referral Stats</h2>
          <ReferralStats 
            totalReferrals={totalReferrals}
            successfulReferrals={successfulReferrals}
            pointsEarned={pointsEarned}
            isLoading={isLoading}
          />
        </div>
        
        <div className="bg-gray-900/70 rounded-lg border border-gray-700 p-6 shadow-md mt-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-100">How It Works</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-900/30 text-purple-300 border border-purple-800/50 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-100">Share your unique referral link</p>
                <p className="text-gray-400 text-sm mt-1">Send your personalized link to friends who might be interested in contributing to open source</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-purple-900/30 text-purple-300 border border-purple-800/50 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-100">Friends sign up using your link</p>
                <p className="text-gray-400 text-sm mt-1">When they create an account through your link, they'll be connected to your referral</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-purple-900/30 text-purple-300 border border-purple-800/50 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-100">Earn 50 points per successful referral</p>
                <p className="text-gray-400 text-sm mt-1">Points can be used for premium features and boost your position on the leaderboard</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-gray-100">Referral Rewards</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-purple-400 font-bold text-xl mb-1">5 Referrals</p>
                  <p className="text-gray-300">Early Access Badge</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-purple-400 font-bold text-xl mb-1">10 Referrals</p>
                  <p className="text-gray-300">Exclusive Profile Theme</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-purple-400 font-bold text-xl mb-1">25 Referrals</p>
                  <p className="text-gray-300">Community Champion Badge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}