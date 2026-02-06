'use client';

import { PostCard } from '@/components/discuss/post-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscussFilterBar } from '@/components/discuss/discuss-filter-bar';
import { DiscussListSkeleton } from '@/components/discuss/discuss-skeleton';
import { DiscussService, type Post } from '@/services/discuss-service';
import { toastService } from '@/services/toasts-service';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DiscussListProps {
    onTagSelect?: (tags: any[]) => void;
    externalTagSelection?: any[] | null;
}

export function DiscussList({ onTagSelect, externalTagSelection }: DiscussListProps = {}) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'newest' | 'trending'>('newest');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<any[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<any[]>([]);

    useEffect(() => {
        // Fetch suggested tags on mount
        const fetchTags = async () => {
            try {
                const result = await DiscussService.getTags({ limit: 20 });
                setSuggestedTags(result.data || []);
            } catch (error) {
                console.error('Failed to fetch tags', error);
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        onTagSelect?.(selectedTags);
    }, [selectedTags, onTagSelect]);

    useEffect(() => {
        if (externalTagSelection !== null && Array.isArray(externalTagSelection)) {
            setSelectedTags(externalTagSelection);
        }
    }, [externalTagSelection]);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const result = await DiscussService.getPosts({
                    page,
                    limit: 10,
                    sortBy: activeTab,
                    sortOrder,
                    search: searchQuery,
                    tagIds: selectedTags.map(t => t.id)
                });
                setPosts(result.data || []);
                setTotalPages(result.meta.totalPages);
            } catch (error) {
                toastService.error('Failed to fetch posts');
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPosts();
        }, searchQuery ? 300 : 0);

        return () => clearTimeout(timeoutId);
    }, [activeTab, sortOrder, page, searchQuery, selectedTags]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [activeTab, sortOrder, searchQuery, selectedTags]);

    return (
        <div className="space-y-6">
            <DiscussFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                suggestedTags={suggestedTags}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />

            <div>
                {isLoading ? (
                    <DiscussListSkeleton count={5} />
                ) : Array.isArray(posts) && posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-center gap-4 py-4 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                                className="gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            <span className="text-sm text-muted-foreground font-medium">
                                Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isLoading}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p className="text-lg font-medium mb-1">No posts found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
