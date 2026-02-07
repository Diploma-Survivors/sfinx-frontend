'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types/problems';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface TopicFilterProps {
  topics: Topic[];
  selectedTopicIds: number[];
  isLoading: boolean;
  onTopicToggle: (topicId: number, isSelected: boolean) => void;
  onClearAll: () => void;
}

export default function TopicFilter({
  topics,
  selectedTopicIds,
  isLoading,
  onTopicToggle,
  onClearAll,
}: TopicFilterProps) {
  const { t } = useTranslation('problems');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTopics = topics.filter((topic) =>
    selectedTopicIds.includes(topic.id)
  );

  const availableTopics = topics.filter(
    (topic) => !selectedTopicIds.includes(topic.id)
  );

  const filteredTopics = availableTopics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (topicId: number) => {
    onTopicToggle(topicId, true);
    setSearchQuery('');
    setOpen(false);
  };

  const handleRemove = (topicId: number) => {
    onTopicToggle(topicId, false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('topics')}
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 border-dashed gap-1 text-muted-foreground hover:text-foreground px-2"
              >
                <Plus className="h-3 w-3" />
                <span className="text-xs">{t('topics')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]" align="start">
              <Command>
                <CommandInput
                  placeholder={t('search_topics')}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {t('loading')}
                    </div>
                  ) : filteredTopics.length === 0 ? (
                    <CommandEmpty>{t('no_topics_found')}</CommandEmpty>
                  ) : (
                    filteredTopics.map((topic) => (
                      <CommandItem
                        key={topic.id}
                        value={topic.name}
                        onSelect={() => handleSelect(topic.id)}
                      >
                        {topic.name}
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selectedTopics.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t('clear_all')}
          </button>
        )}
      </div>

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTopics.map((topic) => (
            <Badge
              key={topic.id}
              variant="secondary"
              className="gap-1 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            >
              {topic.name}
              <button
                type="button"
                onClick={() => handleRemove(topic.id)}
                className="ml-1 rounded-sm hover:bg-primary/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
