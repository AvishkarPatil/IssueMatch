import React from 'react';
import { Users, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

type ReferralStatsProps = {
  totalReferrals: number;
  successfulReferrals: number;
  pointsEarned: number;
  isLoading: boolean;
};

export default function ReferralStats({ 
  totalReferrals, 
  successfulReferrals, 
  pointsEarned,
  isLoading 
}: ReferralStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800/50 h-40 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Invites',
      value: totalReferrals,
      icon: <Users className="h-7 w-7" />,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Successful Signups',
      value: successfulReferrals,
      icon: <CheckCircle className="h-7 w-7" />,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Points Earned',
      value: pointsEarned,
      icon: <Sparkles className="h-7 w-7" />,
      gradient: 'from-[#e88951] to-[#f59e6c]',
      bgGradient: 'from-[#e88951]/10 to-[#f59e6c]/10',
      borderColor: 'border-[#e88951]/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
          <div className={`relative bg-white dark:bg-[#161b22] border ${stat.borderColor} rounded-2xl p-6 transition-all hover:scale-105 shadow-lg`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.title}</p>
                <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3 w-3" />
              <span>Real-time updates</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}