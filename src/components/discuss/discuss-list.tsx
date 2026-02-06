'use client';

import { PostCard } from '@/components/discuss/post-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscussService, type Post } from '@/services/discuss-service';
import { Flame, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DiscussList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('trending');

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const result = await DiscussService.getPosts({
                    page: 1,
                    limit: 10,
                    sortBy: activeTab
                });
                setPosts(result.data || []);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs defaultValue="trending" className="w-full sm:w-auto" value={activeTab} onValueChange={setActiveTab}>
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
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 rounded-xl border border-border bg-card/50 animate-pulse" />
                    ))
                ) : Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No posts found. Be the first to start a discussion!
                    </div>
                )}
            </div>
        </div>
    );
}
