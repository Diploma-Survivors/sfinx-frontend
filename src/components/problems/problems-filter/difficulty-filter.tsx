'use client';

import { cn } from '@/lib/utils';
import type { ProblemDifficulty } from '@/types/problems';
import { useTranslation } from 'react-i18next';

interface DifficultyFilterProps {
  selectedDifficulty?: ProblemDifficulty;
  onDifficultyChange: (difficulty?: ProblemDifficulty) => void;
}

export default function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFilterProps) {
  const { t } = useTranslation('problems');

  const difficulties = [
    {
      value: 'easy',
      label: t('difficulty_easy'),
      activeClass: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/15',
      inactiveClass: 'border-border/40 hover:border-green-500/30 hover:bg-green-500/5'
    },
    {
      value: 'medium',
      label: t('difficulty_medium'),
      activeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/15',
      inactiveClass: 'border-border/40 hover:border-yellow-500/30 hover:bg-yellow-500/5'
    },
    {
      value: 'hard',
      label: t('difficulty_hard'),
      activeClass: 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/15',
      inactiveClass: 'border-border/40 hover:border-red-500/30 hover:bg-red-500/5'
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('difficulty')}
        </label>
        {selectedDifficulty && (
          <button
            type="button"
            onClick={() => onDifficultyChange(undefined)}
            className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((option) => {
          const isSelected = selectedDifficulty === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onDifficultyChange(
                  isSelected ? undefined : (option.value as ProblemDifficulty)
                )
              }
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
                isSelected ? option.activeClass : `text-muted-foreground ${option.inactiveClass}`
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
