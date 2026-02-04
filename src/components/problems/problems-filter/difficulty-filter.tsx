import type { ProblemDifficulty } from '@/types/problems';

interface DifficultyFilterProps {
  selectedDifficulty?: ProblemDifficulty;
  onDifficultyChange: (difficulty?: ProblemDifficulty) => void;
}

import { useTranslation } from 'react-i18next';

export default function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultyFilterProps) {
  const { t } = useTranslation('problems');
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-foreground">
          {t('difficulty_label')}:
        </label>
        {selectedDifficulty && (
          <button
            type="button"
            onClick={() => onDifficultyChange(undefined)}
            className="cursor-pointer text-xs text-destructive hover:underline font-medium transition-colors"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {[
          { value: 'easy', label: t('difficulty_easy') },
          { value: 'medium', label: t('difficulty_medium') },
          { value: 'hard', label: t('difficulty_hard') },
        ].map((option) => {
          const isSelected = selectedDifficulty === option.value;
          const colorMap: Record<string, string> = {
            easy: isSelected
              ? 'bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'
              : 'bg-background text-muted-foreground border-transparent hover:bg-muted',
            medium: isSelected
              ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800'
              : 'bg-background text-muted-foreground border-transparent hover:bg-muted',
            hard: isSelected
              ? 'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800'
              : 'bg-background text-muted-foreground border-transparent hover:bg-muted',
          };

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onDifficultyChange(
                  isSelected ? undefined : (option.value as ProblemDifficulty)
                )
              }
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors border
                ${colorMap[option.value]}
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
