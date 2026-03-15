'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InterviewMode,
  InterviewDifficulty,
  InterviewerPersonality,
} from '@/types/interview';
import { Clock, BarChart3, UserCircle } from 'lucide-react';

interface InterviewCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    mode: InterviewMode,
    difficulty: InterviewDifficulty,
    personality: InterviewerPersonality
  ) => void;
  isLoading?: boolean;
}

const getModeOptions = (t: (key: string) => string) => [
  { value: InterviewMode.SHORT, label: t('customization.mode_short') },
  { value: InterviewMode.STANDARD, label: t('customization.mode_standard') },
  { value: InterviewMode.LONG, label: t('customization.mode_long') },
];

const getDifficultyOptions = (t: (key: string) => string) => [
  { value: InterviewDifficulty.ENTRY, label: t('customization.difficulty_entry') },
  { value: InterviewDifficulty.EXPERIENCED, label: t('customization.difficulty_experienced') },
  { value: InterviewDifficulty.SENIOR, label: t('customization.difficulty_senior') },
];

const getPersonalityOptions = (t: (key: string) => string) => [
  { value: InterviewerPersonality.EASY_GOING, label: t('customization.personality_easy_going') },
  { value: InterviewerPersonality.STRICT, label: t('customization.personality_strict') },
  { value: InterviewerPersonality.JACKASS, label: t('customization.personality_jackass') },
];

export function InterviewCustomizationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: InterviewCustomizationModalProps) {
  const { t } = useTranslation('interview');
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.STANDARD);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>(
    InterviewDifficulty.ENTRY
  );
  const [personality, setPersonality] = useState<InterviewerPersonality>(
    InterviewerPersonality.EASY_GOING
  );

  const handleConfirm = () => {
    onConfirm(mode, difficulty, personality);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('customization.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('customization.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interview Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('customization.mode')}
            </label>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as InterviewMode)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('customization.mode_short')} />
              </SelectTrigger>
              <SelectContent>
                {getModeOptions(t).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('customization.difficulty')}
            </label>
            <Select
              value={difficulty}
              onValueChange={(value) =>
                setDifficulty(value as InterviewDifficulty)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('customization.difficulty_entry')} />
              </SelectTrigger>
              <SelectContent>
                {getDifficultyOptions(t).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personality */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              {t('customization.personality')}
            </label>
            <Select
              value={personality}
              onValueChange={(value) =>
                setPersonality(value as InterviewerPersonality)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('customization.personality_easy_going')} />
              </SelectTrigger>
              <SelectContent>
                {getPersonalityOptions(t).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('endDialog.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t('greeting.starting') : t('start')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
