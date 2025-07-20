'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardTable from '../../components/leaderboard/LeaderboardTable';
import ScoreCard from '../../components/leaderboard/ScoreCard';
import { Filter, Search, Trophy, Award, Calendar } from 'lucide-react';
import { leaderboardUsers, currentUserStats } from '../../lib/dummyData';
import { useAuth } from '../../context/auth-context';

export default function LeaderboardPage() {
  const [users, setUsers] = useState(leaderboardUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all-time');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter users based on selected filter and search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillBadges.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'contributions') return user.contributions > 0 && matchesSearch;
    if (filter === 'mentorships') return user.mentorships > 0 && matchesSearch;
    return matchesSearch;
  });

  // Get current user stats from dummy data
  const userRank = currentUserStats.rank;
  const userScore = currentUserStats.score;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-100">Developer Leaderboard</h1>
        </div>
        <p className="text-gray-400 mt-2 ml-11">
          Track your progress and see how you rank among other contributors
        </p>
      </div>

      <ScoreCard 
        totalUsers={users.length}
        userRank={userRank}
        userScore={userScore}
        isLoading={isLoading}
      />

      <div className="bg-gray-900/70 rounded-lg shadow-md border border-gray-700 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search developers or skills..."
              className="pl-10 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400 h-4 w-4" />
              <select
                className="border border-gray-700 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
                <option value="this-week">This Week</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <select
                className="border border-gray-700 bg-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Developers</option>
                <option value="contributions">With Contributions</option>
                <option value="mentorships">With Mentorships</option>
              </select>
            </div>
          </div>
        </div>

        <LeaderboardTable users={filteredUsers} isLoading={isLoading} />
        
        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Earn badges by contributing to open source projects</span>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm">
            Share Your Rank
          </button>
        </div>
      </div>
    </div>
  );
}