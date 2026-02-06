
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscussService, type Tag } from '@/services/discuss-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface TopicSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    suggestedTags?: Tag[];
}

export function TopicSelector({ selectedTags, onTagsChange, suggestedTags = [] }: TopicSelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchedTags, setFetchedTags] = useState<Tag[]>(suggestedTags);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search query
    const [debouncedSearch] = useDebounce(searchQuery, 300);

    const fetchTags = useCallback(async (search?: string) => {
        setIsLoading(true);
        try {
            const result = await DiscussService.getTags({
                search,
                limit: 20
            });
            setFetchedTags(result.data || []);
        } catch (error) {
            console.error('Failed to fetch tags', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch initial tags when opened
    useEffect(() => {
        if (open) {
            fetchTags(debouncedSearch);
        }
    }, [open, debouncedSearch, fetchTags]);

    const toggleTag = (tag: Tag) => {
        if (selectedTags.find(t => t.id === tag.id)) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 border-dashed gap-1 text-muted-foreground hover:text-foreground px-3">
                    <Plus className="h-4 w-4" />
                    Tag
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search tag..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="p-1 space-y-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                    {fetchedTags.map(tag => {
                                        const isSelected = selectedTags.some(t => t.id === tag.id);
                                        if (isSelected) return null;
                                        return (
                                            <CommandItem key={tag.id} onSelect={() => { toggleTag(tag); setOpen(false); }}>
                                                {tag.name}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
