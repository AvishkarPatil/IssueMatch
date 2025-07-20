import React from 'react';
import { Users, Award, TrendingUp } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800/50 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Referrals',
      value: totalReferrals,
      icon: <Users className="h-8 w-8 text-cyan-400" />,
      color: 'bg-cyan-900/20 border-cyan-700/30',
      textColor: 'text-cyan-400',
      iconBg: 'bg-cyan-900/30',
    },
    {
      title: 'Successful Signups',
      value: successfulReferrals,
      icon: <Award className="h-8 w-8 text-green-400" />,
      color: 'bg-green-900/20 border-green-700/30',
      textColor: 'text-green-400',
      iconBg: 'bg-green-900/30',
    },
    {
      title: 'Points Earned',
      value: pointsEarned,
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      color: 'bg-purple-900/20 border-purple-700/30',
      textColor: 'text-purple-400',
      iconBg: 'bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i}
          className={`p-6 rounded-lg border ${stat.color} transition-all hover:shadow-lg bg-gray-900/50 backdrop-blur-sm`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`p-2 rounded-full ${stat.iconBg}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}