import type { LeaderboardEntry } from "@/types/contests";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { ContestLeaderboardEntry } from "./contest-leaderboard-entry";

interface ContestLeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}

export function ContestLeaderboardList({
  leaderboard,
  userRank,
}: ContestLeaderboardListProps): JSX.Element {
  const { t } = useTranslation("contests");

  return (
    <div className="p-4">
      <div className="space-y-2">
        {/* User Rank (Fixed at top if exists) */}
        {userRank && (
          <div className="mb-4 border-b border-border pb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {t("yourRank")}
            </div>
            <ContestLeaderboardEntry entry={userRank} isCurrentUser={true} />
          </div>
        )}

        {/* Leaderboard List */}
        <div className="text-xs font-medium text-muted-foreground mb-2">
          {t("leaderboard")}
        </div>
        {leaderboard.map((entry) => (
          <ContestLeaderboardEntry
            key={entry.user.id}
            entry={entry}
            isCurrentUser={userRank?.user.id === entry.user.id}
          />
        ))}
      </div>
    </div>
  );
}
