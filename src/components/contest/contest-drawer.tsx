import { Badge } from '@/components/ui/badge';

import { ContestLeaderboardList } from './contest-leaderboard-list';
import {
  type ContestProblem,
  ContestProblemStatus,
  ContestProblemStatusTooltip,
  type LeaderboardEntry,
} from '@/types/contests';
import { getDifficultyColor } from '@/types/problems';
import { CheckCircle, Minus, X } from 'lucide-react';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../ui/tooltip';

interface ContestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contestName: string;
  problems: ContestProblem[];
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  currentProblemId: string;
  onProblemClick: (problemId: string) => void;
}

const ContestProblemStatusIcons: Record<ContestProblemStatus, JSX.Element> = {
  [ContestProblemStatus.SOLVED]: (
    <CheckCircle className="w-5 h-5 text-green-600" />
  ),
  [ContestProblemStatus.NOT_STARTED]: <div />,
  [ContestProblemStatus.ATTEMPTED]: (
    <Minus className="w-5 h-5 text-amber-600" />
  ),
};

export default function ContestDrawer({
  isOpen,
  onClose,
  contestName,
  problems,
  leaderboard,
  userRank,
  currentProblemId,
  onProblemClick,
}: ContestDrawerProps) {
  const { t } = useTranslation('contests');
  const [activeTab, setActiveTab] = useState<'problems' | 'ranking'>(
    'problems'
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 w-96 bg-background border-r border-border
          z-[60] shadow-2xl flex flex-col
          transform transition-transform duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-card/50">
          <h2 className="text-lg font-bold text-foreground">{contestName}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-border bg-muted/20">
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'problems'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            {t('problems')}
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ranking'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            {t('ranking')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background/50">
          {activeTab === 'problems' ? (
            <div className="p-4 space-y-2">
              {problems.map((problem, idx) => {
                // Determine status from userRank if available, otherwise fallback to problem.status
                let status = problem.status;
                if (userRank) {
                  const problemStatus = userRank.problemStatus.find(
                    (p) => p.problemId.toString() === problem.id
                  );
                  if (problemStatus) {
                    status = problemStatus.status;
                  } else {
                    status = ContestProblemStatus.NOT_STARTED;
                  }
                }

                return (
                  <button
                    key={problem.id}
                    onClick={() => {
                      onProblemClick(problem.id);
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      currentProblemId === problem.id
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-border hover:bg-accent/50 hover:border-accent'
                    }`}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <Tooltip content={ContestProblemStatusTooltip[status]}>
                        <div className="flex-shrink-0 mt-0.5 min-w-5">
                          {ContestProblemStatusIcons[status]}
                        </div>
                      </Tooltip>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            Q{idx + 1}.
                          </span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {problem.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getDifficultyColor(
                              problem.difficulty
                            )} text-xs`}
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {`${problem.userScore ?? 0}/${
                              problem.maxScore ?? 0
                            } pts`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <ContestLeaderboardList
              leaderboard={leaderboard}
              userRank={userRank}
            />
          )}
        </div>
      </div>
    </>
  );
}
