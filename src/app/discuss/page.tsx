'use client';

import { DiscussList } from '@/components/discuss/discuss-list';
import { TrendingTopics } from '@/components/discuss/trending-topics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PenSquare, Search, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function DiscussPage() {
    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Header Mobile Only (if needed, otherwise relying on list header) */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Discussion</h1>
                        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                            <PenSquare className="w-4 h-4" /> Create
                        </Button>
                    </div>

                    <DiscussList />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:flex flex-col gap-6">
                    <div className="sticky top-24 space-y-8">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search topics..." className="pl-8 bg-card border-border/60" />
                        </div>

                        {/* Create Button */}
                        <Link href="/discuss/create" className="w-full block">
                            <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30" size="lg">
                                <PenSquare className="w-4 h-4" />
                                New Post
                            </Button>
                        </Link>

                        {/* Trending / Info Card */}
                        <TrendingTopics />
                    </div>
                </div>

            </div>
        </div>
    );
}
