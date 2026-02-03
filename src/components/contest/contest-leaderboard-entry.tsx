import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import {
  ContestProblemStatus,
  ContestProblemStatusTooltip,
  type LeaderboardEntry,
} from '@/types/contests';
import type { JSX } from 'react';

interface ContestLeaderboardEntryProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

export function ContestLeaderboardEntry({
  entry,
  isCurrentUser,
}: ContestLeaderboardEntryProps): JSX.Element {
  return (
    <div
      className={`p-3 rounded-lg border ${
        isCurrentUser
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-card'
      }`}
    >
      {/* Row 1: Rank, Avatar + Username, Total Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold w-6 text-center ${
              entry.rank === 1
                ? 'text-yellow-500' // Gold
                : entry.rank === 2
                  ? 'text-slate-400' // Silver
                  : entry.rank === 3
                    ? 'text-amber-700' // Bronze
                    : 'text-muted-foreground'
            }`}
          >
            #{entry.rank}
          </span>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-border">
              <AvatarImage src={entry.user.avatarUrl} />
              <AvatarFallback>
                <img
                  src="/avatars/placeholder.png"
                  alt={entry.user.username}
                  className="w-full h-full object-cover"
                />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {entry.user.username}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-primary block">
            {entry.totalScore}
          </span>
        </div>
      </div>

      {/* Row 2: Problem Status Indicators */}
      <div className="flex gap-1.5 h-2">
        {entry.problemStatus.map((status, i) => (
          <Tooltip
            key={i}
            content={`Q${status.problemOrder}: ${
              ContestProblemStatusTooltip[status.status]
            }`}
          >
            <div
              className={`flex-1 rounded-sm transition-colors ${
                status.status === ContestProblemStatus.SOLVED
                  ? 'bg-green-500'
                  : status.status === ContestProblemStatus.ATTEMPTED
                    ? 'bg-red-500'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
