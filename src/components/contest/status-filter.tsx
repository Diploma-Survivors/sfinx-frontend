'use client';

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusToggle: (status: string, isSelected: boolean) => void;
  onClearAll: () => void;
}

export default function StatusFilter({
  selectedStatuses,
  onStatusToggle,
  onClearAll,
}: StatusFilterProps) {
  const { t } = useTranslation('contests');

  const options = [
    { value: 'upcoming', label: t('upcoming') },
    { value: 'ongoing', label: t('ongoing') },
    { value: 'ended', label: t('ended') },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-foreground">
          {t('status')}:
        </label>
        {selectedStatuses.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
          >
            {t('clear_all')} ({selectedStatuses.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => {
          const isSelected = selectedStatuses.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusToggle(option.value, isSelected)}
              className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm
                  transition-all duration-200 hover:scale-[1.02]
                  bg-background text-foreground border-border hover:border-primary/50
                  ${isSelected ? 'border-primary' : ''}
                `}
            >
              <div
                className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-background border-input'
                    }
                  `}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
