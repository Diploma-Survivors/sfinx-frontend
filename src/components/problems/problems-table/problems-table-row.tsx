'use client';

import { useApp } from '@/contexts/app-context';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import type { Problem } from '@/types/problems';
import { CheckCircle2, Circle, Clock, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PremiumModal } from '@/components/problems/premium-modal';

interface ProblemTableRowProps {
  problem: Problem;
}

export default function ProblemTableRow({ problem }: ProblemTableRowProps) {
  const router = useRouter();
  const { user } = useApp();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Difficulty Badge Logic
  const getDifficultyColor = (difficulty: ProblemDifficulty) => {
    switch (difficulty) {
      case ProblemDifficulty.EASY:
        return 'text-green-600 bg-green-500/10 border-green-200 dark:text-green-400 dark:border-green-800';
      case ProblemDifficulty.MEDIUM:
        return 'text-yellow-600 bg-yellow-500/10 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800';
      case ProblemDifficulty.HARD:
        return 'text-red-600 bg-red-500/10 border-red-200 dark:text-red-400 dark:border-red-800';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getDifficultyLabel = (difficulty: ProblemDifficulty) => {
    return difficulty
      ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      : 'Unknown';
  };

  const handleRowClick = () => {
    if (problem.isPremium && (!user || !user.isPremium)) {
      setIsPremiumModalOpen(true);
      return;
    }
    router.push(`/problems/${problem.id}/description`);
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors group border-border/50 h-14"
        onClick={handleRowClick}
      >
        {/* Status */}
        <TableCell className="text-center p-0 w-12">
          <div className="flex justify-center items-center">
            {problem.status === ProblemStatus.SOLVED ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : problem.status === ProblemStatus.ATTEMPTED ? (
              <Circle className="w-4 h-4 text-muted-foreground/30" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
        </TableCell>

        {/* Index */}
        <TableCell className="font-mono text-muted-foreground w-16 text-center text-sm">
          {problem.id}
        </TableCell>

        {/* Title */}
        <TableCell className="font-medium text-foreground text-base w-full">
          <div className="flex items-center flex-wrap gap-2">
            <span className="truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
              {problem.title}
            </span>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {problem.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border/50 whitespace-nowrap"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TableCell>

        {/* Premium Status */}
        <TableCell className="p-0 w-4 text-center">
          {problem.isPremium && (
            <Tooltip content="Premium Problem">
              <div className="flex justify-center items-center">
                <Lock className="w-3.5 h-3.5 text-yellow-500" />
              </div>
            </Tooltip>
          )}
        </TableCell>

        {/* Difficulty */}
        <TableCell className="w-32">
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-20',
              getDifficultyColor(problem.difficulty)
            )}
          >
            {getDifficultyLabel(problem.difficulty)}
          </span>
        </TableCell>

        {/* Acceptance */}
        <TableCell className="text-center w-28">
          <span className="text-muted-foreground text-sm font-mono">
            {problem.acceptanceRate !== undefined
              ? `${Number(problem.acceptanceRate).toFixed(1)}%`
              : '-'}
          </span>
        </TableCell>
      </TableRow>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </>
  );
}
