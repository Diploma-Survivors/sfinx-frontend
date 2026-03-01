'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Code, Trophy, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

import ProblemTable from '@/components/problems/problems-table/problems-table';
import ContestTable from '@/components/contest/contest-table';
import { PostCard } from '@/components/discuss/posts/post-card';

import { ProblemsService } from '@/services/problems-service';
import { ContestsService } from '@/services/contests-service';
import { DiscussService, type Post } from '@/services/discuss-service';
import { UserService } from '@/services/user-service';
import type { Problem } from '@/types/problems';
import type { Contest } from '@/types/contests';
import type { UserProfile } from '@/types/user';
import { toastService } from '@/services/toasts-service';

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation('common');

    const currentQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || 'problems';

    const [activeTab, setActiveTab] = useState(initialCategory);

    // Data states
    const [problems, setProblems] = useState<Problem[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);

    // Meta states
    const [totalProblems, setTotalProblems] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchResults = async (query: string, category: string, pageNum: number, append = false) => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const limit = 10;
            switch (category) {
                case 'problems': {
                    const res = await ProblemsService.getProblemList({
                        page: pageNum,
                        limit,
                        search: query,
                    });
                    const fetchedProblems = res.data.data.data;
                    const meta = res.data.data.meta;
                    setProblems(prev => append ? [...prev, ...fetchedProblems] : fetchedProblems);
                    setTotalProblems(meta.total);
                    setHasMore(meta.hasNextPage);
                    break;
                }
                case 'contests': {
                    const res = await ContestsService.getContestList({
                        page: pageNum,
                        limit,
                        search: query,
                    });
                    const fetchedContests = res.data.data.data;
                    const meta = res.data.data.meta;
                    setContests(prev => append ? [...prev, ...fetchedContests] : fetchedContests);
                    setHasMore(meta.hasNextPage);
                    break;
                }
                case 'discuss': {
                    const res = await DiscussService.getPosts({
                        page: pageNum,
                        limit,
                        search: query,
                    });
                    const fetchedPosts = res.data || [];
                    const meta = res.meta;
                    setPosts(prev => append ? [...prev, ...fetchedPosts] : fetchedPosts);
                    setHasMore(pageNum < (meta?.totalPages || 0));
                    break;
                }
                case 'users': {
                    const res = await UserService.searchPublicUsers(query, pageNum, limit);
                    const fetchedUsers = res.data.data.data;
                    const meta = res.data.data.meta;
                    setUsers(prev => append ? [...prev, ...fetchedUsers] : fetchedUsers);
                    setHasMore(pageNum < meta.totalPages);
                    break;
                }
            }
        } catch (error) {
            toastService.error(t('error_fetching_search'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentQuery) {
            setPage(1);
            fetchResults(currentQuery, activeTab, 1, false);
        }
    }, [currentQuery, activeTab]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', val);
        if (currentQuery.trim()) {
            params.set('q', currentQuery.trim());
        }
        router.push(`/search?${params.toString()}`);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(currentQuery, activeTab, nextPage, true);
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Search Results Area */}
                {currentQuery ? (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="inline-flex justify-start bg-muted/50 rounded-xl p-1 mb-8 h-auto overflow-x-auto flex-nowrap hide-scrollbar gap-1">
                            <TabsTrigger
                                value="problems"
                                className="rounded-lg border-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    <span>Problems</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="contests"
                                className="rounded-lg border-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    <span>Contests</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="discuss"
                                className="rounded-lg border-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Discuss</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                className="rounded-lg border-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Users</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[400px]">
                            <TabsContent value="problems" className="mt-0 outline-none">
                                {problems.length > 0 ? (
                                    <ProblemTable
                                        problems={problems}
                                        hasMore={hasMore}
                                        onLoadMore={handleLoadMore}
                                        isLoading={isLoading}
                                        totalCount={totalProblems}
                                        openInNewTab={true}
                                    />
                                ) : !isLoading && (
                                    <EmptyState query={currentQuery} category="problems" />
                                )}
                                {isLoading && problems.length === 0 && <LoadingState />}
                            </TabsContent>

                            <TabsContent value="contests" className="mt-0 outline-none">
                                {contests.length > 0 ? (
                                    <div className="space-y-4">
                                        <ContestTable
                                            contests={contests}
                                            pageInfo={{ hasNextPage: hasMore }}
                                            onLoadMore={handleLoadMore}
                                            isLoading={isLoading}
                                            error={null}
                                            openInNewTab={true}
                                        />
                                    </div>
                                ) : !isLoading && (
                                    <EmptyState query={currentQuery} category="contests" />
                                )}
                                {isLoading && contests.length === 0 && <LoadingState />}
                            </TabsContent>

                            <TabsContent value="discuss" className="mt-0 outline-none">
                                {posts.length > 0 ? (
                                    <div className="space-y-4 max-w-4xl">
                                        {posts.map((post) => (
                                            <PostCard key={post.id} post={post} openInNewTab={true} />
                                        ))}
                                        {hasMore && (
                                            <div className="flex justify-center pt-4">
                                                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                                                    {isLoading ? 'Loading...' : 'Load More'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : !isLoading && (
                                    <EmptyState query={currentQuery} category="discussions" />
                                )}
                                {isLoading && posts.length === 0 && <LoadingState />}
                            </TabsContent>

                            <TabsContent value="users" className="mt-0 outline-none">
                                {users.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {users.map((user) => (
                                            <Link key={user.id} href={`/profile/${user.id}`} target="_blank">
                                                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors duration-200">
                                                    <Avatar className="w-12 h-12 border border-border">
                                                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                                                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-medium text-foreground truncate">
                                                            {user.fullName || user.username}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground truncate">
                                                            @{user.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {hasMore && (
                                            <div className="col-span-full flex justify-center pt-4">
                                                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                                                    {isLoading ? 'Loading...' : 'Load More'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : !isLoading && (
                                    <EmptyState query={currentQuery} category="users" />
                                )}
                                {isLoading && users.length === 0 && <LoadingState />}
                            </TabsContent>
                        </div>
                    </Tabs>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                            <SearchIcon className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Search Code Sfinx</h2>
                        <p className="text-muted-foreground max-w-md">
                            Enter a search query above to find problems, contests, discussions, or connect with other users.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

function EmptyState({ query, category }: { query: string, category: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-card/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <SearchIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No {category} found</h3>
            <p className="text-muted-foreground text-sm">
                We couldn't find anything matching "{query}"
            </p>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SearchPageContent />
        </Suspense>
    );
}
