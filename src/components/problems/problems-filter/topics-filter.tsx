'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types/topics';
import { Check, CheckCircle2, Search } from 'lucide-react';
import React from 'react';

interface TopicFilterProps {
  topics: Topic[];
  selectedTopicIds: number[];
  isLoading: boolean;
  onTopicToggle: (topicId: number, isSelected: boolean) => void;
  onClearAll: () => void;
}

import { useTranslation } from 'react-i18next';

export default function TopicFilter({
  topics,
  selectedTopicIds,
  isLoading,
  onTopicToggle,
  onClearAll,
}: TopicFilterProps) {
  const { t } = useTranslation('problems');
  const [search, setSearch] = React.useState('');

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-foreground">
          {t('topic_label')}:
        </label>
        {selectedTopicIds.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="cursor-pointer text-xs text-destructive hover:underline font-medium transition-colors"
          >
            {t('clear_all')} ({selectedTopicIds.length})
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder={t('search_topics')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-xs bg-background"
        />
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
          {filteredTopics.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2">
              {t('no_topics_found')}
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isSelected = selectedTopicIds.includes(topic.id);

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onTopicToggle(topic.id, isSelected)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-background text-muted-foreground border-transparent hover:bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-background border-muted-foreground/30'
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
