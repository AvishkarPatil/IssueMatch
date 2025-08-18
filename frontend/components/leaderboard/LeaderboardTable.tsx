import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Row,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Trophy, Medal, Star } from 'lucide-react';

type LeaderboardUser = {
  rank: number;
  username: string;
  avatarUrl: string;
  score: number;
  contributions: number;
  mentorships: number;
  skillBadges: string[];
};

type LeaderboardTableProps = {
  users: LeaderboardUser[];
  isLoading: boolean;
};

export default function LeaderboardTable({ users, isLoading }: LeaderboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'score', desc: true }]);

  const columns = [
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => {
        const rank = row.original.rank;
        let rankDisplay;
        
        if (rank === 1) {
          rankDisplay = <Trophy className="h-5 w-5 text-yellow-500" />;
        } else if (rank === 2) {
          rankDisplay = <Medal className="h-5 w-5 text-gray-400" />;
        } else if (rank === 3) {
          rankDisplay = <Medal className="h-5 w-5 text-amber-700" />;
        } else {
          rankDisplay = <div className="text-center font-semibold">{rank}</div>;
        }
        
        return (
          <div className="flex justify-center items-center">
            {rankDisplay}
          </div>
        );
      },
    },
    {
      accessorKey: 'username',
      header: 'Developer',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => (
        <div className="flex items-center gap-2">
          <img 
            src={row.original.avatarUrl} 
            alt={row.original.username} 
            className="w-8 h-8 rounded-full border-2 border-blue-500/30 dark:border-purple-500/30"
          />
          <span className="text-gray-900 dark:text-white">{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => (
        <div className="font-semibold text-blue-600 dark:text-purple-500 flex items-center gap-1">
          <Star className="h-4 w-4 fill-blue-600 dark:fill-purple-500" />
          {row.original.score}
        </div>
      ),
    },
    {
      accessorKey: 'contributions',
      header: 'Contributions',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => (
        <div className="font-medium text-gray-900 dark:text-white">{row.original.contributions}</div>
      ),
    },
    {
      accessorKey: 'mentorships',
      header: 'Mentorships',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => (
        <div className="font-medium text-gray-900 dark:text-white">{row.original.mentorships}</div>
      ),
    },
    {
      accessorKey: 'skillBadges',
      header: 'Top Skills',
      cell: ({ row }: { row: Row<LeaderboardUser> }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skillBadges.slice(0, 3).map((skill: string, i: number) => (
            <span 
              key={i} 
              className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-purple-900/30 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-800/50"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-md bg-white dark:bg-gray-900/50">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}