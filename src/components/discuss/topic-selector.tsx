'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { Tag } from '@/services/discuss-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState } from 'react';

interface TopicSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    suggestedTags: Tag[];
}

export function TopicSelector({ selectedTags, onTagsChange, suggestedTags }: TopicSelectorProps) {
    const [open, setOpen] = useState(false);

    const toggleTag = (tag: Tag) => {
        if (selectedTags.find(t => t.id === tag.id)) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {selectedTags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="gap-1 pl-2 pr-1 py-1 bg-secondary/50 border-secondary">
                    {tag.name}
                    <button
                        onClick={() => toggleTag(tag)}
                        className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        <span className="sr-only">Remove {tag.name}</span>
                    </button>
                </Badge>
            ))}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 border-dashed gap-1 text-muted-foreground hover:text-foreground">
                        <Plus className="h-3.5 w-3.5" />
                        Tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search tag..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {suggestedTags.map(tag => {
                                    const isSelected = selectedTags.some(t => t.id === tag.id);
                                    if (isSelected) return null;
                                    return (
                                        <CommandItem key={tag.id} onSelect={() => { toggleTag(tag); setOpen(false); }}>
                                            {tag.name}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
