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
                {/* Left Side: Search & Tags */}
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

            {/* Active Filters Summary (Optional visual confirmation) */}
            {(selectedTags.length > 0 || searchQuery) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">
                    <span>Filtering by:</span>
                    {searchQuery && (
                        <span className="bg-muted px-2 py-0.5 rounded text-foreground">"{searchQuery}"</span>
                    )}
                    {selectedTags.map(tag => (
                        <span key={tag.id} className="bg-muted px-2 py-0.5 rounded text-foreground">#{tag.name}</span>
                    ))}
                    <button
                        onClick={() => {
                            onSearchChange('');
                            onTagsChange([]);
                        }}
                        className="ml-auto text-primary hover:underline"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
