'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import ReferralLinkGenerator from '../../components/referral/ReferralLinkGenerator';
import ReferralStats from '../../components/referral/ReferralStats';
import { Share2, Gift, Award, Sparkles, Trophy, Crown, Zap, Star } from 'lucide-react';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referral/stats`, {
        credentials: 'include',
      });
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setTotalReferrals(data.totalReferrals);
        setSuccessfulReferrals(data.successfulReferrals);
        setPointsEarned(data.pointsEarned);
      }
      
      const codeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referral/generate-code`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        setReferralCode(codeData.referralCode || '');
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#e88951]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#e88951]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e88951]/10 to-[#f59e6c]/10 border border-[#e88951]/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-[#e88951]" />
            <span className="text-sm font-medium text-[#e88951]">Earn Rewards & Unlock Perks</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent mb-4">
            Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Invite developers to IssueMatch and unlock exclusive rewards, badges, and premium features
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <ReferralLinkGenerator 
            referralCode={referralCode} 
            isLoading={isLoading} 
          />
          
          <ReferralStats 
            totalReferrals={totalReferrals}
            successfulReferrals={successfulReferrals}
            pointsEarned={pointsEarned}
            isLoading={isLoading}
          />

          <div className="grid md:grid-cols-2 gap-8 mt-4">
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#e88951]/10 rounded-lg">
                  <Gift className="h-6 w-6 text-[#e88951]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How It Works</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#e88951] to-[#f59e6c] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Share Your Link</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send your unique referral link to developer friends</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#e88951] to-[#f59e6c] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">They Sign Up</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">When they join using your link, you both get rewarded</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#e88951] to-[#f59e6c] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Earn Rewards</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get 50 points + unlock exclusive badges and features</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#e88951]/5 to-[#f59e6c]/5 dark:from-[#e88951]/10 dark:to-[#f59e6c]/10 rounded-2xl border border-[#e88951]/20 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#e88951]/20 rounded-lg">
                  <Zap className="h-6 w-6 text-[#e88951]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What You Get</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-[#e88951] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">50 Points per Referral</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Boost your leaderboard ranking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-[#e88951] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Exclusive Badges</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Show off your community impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-[#e88951] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Priority Matching</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get better issue recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-[#e88951] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Profile Themes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unlock custom profile designs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#e88951]/10 rounded-lg">
                <Trophy className="h-6 w-6 text-[#e88951]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Milestone Rewards</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/20 to-[#f59e6c]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:border-[#e88951]/50 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e88951] to-[#f59e6c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#e88951] mb-2">3 Referrals</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Early Adopter</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Special badge + 100 bonus points</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/20 to-[#f59e6c]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:border-[#e88951]/50 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e88951] to-[#f59e6c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#e88951] mb-2">10 Referrals</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Community Builder</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Custom profile theme + priority support</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/20 to-[#f59e6c]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:border-[#e88951]/50 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e88951] to-[#f59e6c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#e88951] mb-2">25 Referrals</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Champion</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Gold badge + featured profile + 500 bonus points</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e88951]/20 to-[#f59e6c]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:border-[#e88951]/50 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e88951] to-[#f59e6c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#e88951] mb-2">50 Referrals</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Legend</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Lifetime premium + exclusive perks + 1000 bonus points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}