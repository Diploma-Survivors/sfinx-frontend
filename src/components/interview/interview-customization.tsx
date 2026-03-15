'use client';

import { useTranslation } from 'react-i18next';
import {
  InterviewMode,
  InterviewDifficulty,
  InterviewerPersonality,
} from '@/types/interview';
import { Clock, BarChart3, UserCircle } from 'lucide-react';

interface InterviewCustomizationProps {
  selectedMode: InterviewMode;
  selectedDifficulty: InterviewDifficulty;
  selectedPersonality: InterviewerPersonality;
  onModeChange: (mode: InterviewMode) => void;
  onDifficultyChange: (difficulty: InterviewDifficulty) => void;
  onPersonalityChange: (personality: InterviewerPersonality) => void;
  disabled?: boolean;
}

const MODE_OPTIONS = [
  { value: InterviewMode.SHORT, label: '30 mins', duration: 30 },
  { value: InterviewMode.STANDARD, label: '45 mins', duration: 45 },
  { value: InterviewMode.LONG, label: '60 mins', duration: 60 },
];

const DIFFICULTY_OPTIONS = [
  { value: InterviewDifficulty.ENTRY, label: 'Entry Level' },
  { value: InterviewDifficulty.EXPERIENCED, label: 'Experienced' },
  { value: InterviewDifficulty.SENIOR, label: 'Senior' },
];

const PERSONALITY_OPTIONS = [
  { value: InterviewerPersonality.EASY_GOING, label: 'Easy Going', emoji: '😊' },
  { value: InterviewerPersonality.STRICT, label: 'Strict', emoji: '😐' },
  { value: InterviewerPersonality.JACKASS, label: 'Jackass', emoji: '😤' },
];

export function InterviewCustomization({
  selectedMode,
  selectedDifficulty,
  selectedPersonality,
  onModeChange,
  onDifficultyChange,
  onPersonalityChange,
  disabled = false,
}: InterviewCustomizationProps) {
  const { t } = useTranslation('interview');

  return (
    <div className="space-y-6">
      {/* Interview Mode */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{t('customization.mode')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                selectedMode === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 hover:bg-muted/50 text-muted-foreground'
              } disabled:opacity-50`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <span>{t('customization.difficulty')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDifficultyChange(option.value)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                selectedDifficulty === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 hover:bg-muted/50 text-muted-foreground'
              } disabled:opacity-50`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personality */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UserCircle className="w-4 h-4" />
          <span>{t('customization.personality')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PERSONALITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPersonalityChange(option.value)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                selectedPersonality === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 hover:bg-muted/50 text-muted-foreground'
              } disabled:opacity-50`}
            >
              <span className="text-lg">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
