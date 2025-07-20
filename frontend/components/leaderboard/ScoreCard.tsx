import React from 'react';
import { Trophy, GitPullRequest, Users, Award, Star } from 'lucide-react';

type ScoreCardProps = {
  totalUsers: number;
  userRank?: number;
  userScore?: number;
  isLoading: boolean;
};

export default function ScoreCard({ totalUsers, userRank, userScore, isLoading }: ScoreCardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800/50 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Your Rank',
      value: userRank ? `${userRank} / ${totalUsers}` : 'Not ranked yet',
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      color: 'bg-yellow-900/20 border-yellow-700/30',
      textColor: 'text-yellow-400',
      iconBg: 'bg-yellow-900/30',
    },
    {
      title: 'Your Score',
      value: userScore || 0,
      icon: <Star className="h-8 w-8 text-purple-400 fill-purple-400" />,
      color: 'bg-purple-900/20 border-purple-700/30',
      textColor: 'text-purple-400',
      iconBg: 'bg-purple-900/30',
    },
    {
      title: 'Total Developers',
      value: totalUsers,
      icon: <Users className="h-8 w-8 text-cyan-400" />,
      color: 'bg-cyan-900/20 border-cyan-700/30',
      textColor: 'text-cyan-400',
      iconBg: 'bg-cyan-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, i) => (
        <div 
          key={i}
          className={`p-6 rounded-lg border ${card.color} transition-all hover:shadow-lg bg-gray-900/50 backdrop-blur-sm`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400">{card.title}</p>
              <p className={`text-2xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
            </div>
            <div className={`p-2 rounded-full ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}