'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag } from '@/services/discuss-service';
import { TopicSelector } from './topic-selector';
import { ArrowDown, ArrowUp, Flame, PenSquare, Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DiscussFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    suggestedTags: Tag[];
    activeTab: 'newest' | 'trending';
    onTabChange: (tab: 'newest' | 'trending') => void;
    sortOrder: 'ASC' | 'DESC';
    onSortOrderChange: (order: 'ASC' | 'DESC') => void;
    className?: string;
}

export function DiscussFilterBar({
    searchQuery,
    onSearchChange,
    selectedTags,
    onTagsChange,
    suggestedTags,
    activeTab,
    onTabChange,
    sortOrder,
    onSortOrderChange,
    className
}: DiscussFilterBarProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                {/* Left Side: Search & Add Tag */}
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 h-10 bg-background/50 border-input/60 focus:bg-background transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <TopicSelector
                        selectedTags={selectedTags}
                        onTagsChange={onTagsChange}
                        suggestedTags={suggestedTags}
                    />
                </div>

                {/* Right Side: Filters & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Toggle */}
                    <div className="p-1 bg-muted/50 rounded-lg flex items-center gap-1">
                        <button
                            onClick={() => onTabChange('newest')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeTab === 'newest'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )}
                        >
                            <Sparkles className={cn("w-4 h-4", activeTab === 'newest' && "text-blue-500")} />
                            Newest
                        </button>
                        <button
                            onClick={() => onTabChange('trending')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeTab === 'trending'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )}
                        >
                            <Flame className={cn("w-4 h-4", activeTab === 'trending' && "text-orange-500")} />
                            Hot
                        </button>
                    </div>

                    {/* Sort Order */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSortOrderChange(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                        className="h-9 gap-2 text-muted-foreground hover:text-foreground"
                    >
                        {sortOrder === 'DESC' ? (
                            <>
                                <ArrowDown className="w-4 h-4" />
                                Desc
                            </>
                        ) : (
                            <>
                                <ArrowUp className="w-4 h-4" />
                                Asc
                            </>
                        )}
                    </Button>

                    <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

                    {/* Create Post */}
                    <Link href="/discuss/create">
                        <Button
                            size="sm"
                            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm gap-2"
                        >
                            <PenSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">New Post</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Selected Tags List */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {selectedTags.map(tag => (
                        <div
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/50 border border-secondary text-sm text-secondary-foreground"
                        >
                            {tag.name}
                            <button
                                onClick={() => onTagsChange(selectedTags.filter(t => t.id !== tag.id))}
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:bg-background/50 p-0.5 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {tag.name}</span>
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => onTagsChange([])}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 px-2"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
