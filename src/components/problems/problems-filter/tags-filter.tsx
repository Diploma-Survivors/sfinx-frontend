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
import type { Tag } from '@/types/problems';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface TagFilterProps {
  tags: Tag[];
  selectedTagIds: number[];
  isLoading: boolean;
  onTagToggle: (tagId: number, isSelected: boolean) => void;
  onClearAll: () => void;
  displayLimit?: number;
}

export default function TagFilter({
  tags,
  selectedTagIds,
  isLoading,
  onTagToggle,
  onClearAll,
  displayLimit = 10,
}: TagFilterProps) {
  const { t } = useTranslation('problems');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id));

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (tagId: number) => {
    onTagToggle(tagId, true);
    setSearchQuery('');
    setOpen(false);
  };

  const handleRemove = (tagId: number) => {
    onTagToggle(tagId, false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('tags')}
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 border-dashed gap-1 text-muted-foreground hover:text-foreground px-2"
              >
                <Plus className="h-3 w-3" />
                <span className="text-xs">{t('tags')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]" align="start">
              <Command>
                <CommandInput
                  placeholder={t('search_tags')}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {t('loading')}
                    </div>
                  ) : filteredTags.length === 0 ? (
                    <CommandEmpty>{t('no_tags_found')}</CommandEmpty>
                  ) : (
                    filteredTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => handleSelect(tag.id)}
                      >
                        {tag.name}
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t('clear_all')}
          </button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
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
