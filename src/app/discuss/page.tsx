'use client';

import { DiscussList } from '@/components/discuss/discuss-list';
import { GuidelinesDialog } from '@/components/discuss/guidelines-dialog';
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


                    <DiscussList />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:flex flex-col gap-6">
                    <div className="sticky top-24 space-y-8">

                        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-border/50">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Community Guidelines
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Keep discussions respectful and helpful. Share your knowledge and learn from others!
                            </p>
                            <GuidelinesDialog />
                        </div>

                        {/* Trending / Info Card */}
                        <TrendingTopics />
                    </div>
                </div>

            </div>
        </div>
    );
}
