'use client';

import { PostCard } from '@/components/discuss/post-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscussService, type Post } from '@/services/discuss-service';
import { toastService } from '@/services/toasts-service';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Flame, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DiscussList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('newest');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {

                const result = await DiscussService.getPosts({
                    page,
                    limit: 10,
                    sortBy: activeTab,
                    sortOrder
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

        fetchPosts();
    }, [activeTab, sortOrder, page]);

    // Reset page when tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab, sortOrder]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs defaultValue="newest" className="w-full sm:w-auto" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto p-1 bg-muted/50 rounded-lg">
                        <TabsTrigger value="trending" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Flame className="w-4 h-4 mr-2 text-orange-500" />
                            Trending
                        </TabsTrigger>
                        <TabsTrigger value="newest" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                            Newest
                        </TabsTrigger>
                    </TabsList>
                </Tabs>


                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                    className="gap-2"
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
            </div>

            <div>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))
                ) : Array.isArray(posts) && posts.length > 0 ? (
                    <>
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
                    </>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No posts found. Be the first to start a discussion!
                    </div>
                )}
            </div>
        </div>
    );
}
