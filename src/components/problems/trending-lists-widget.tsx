'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { favoriteListService } from '@/services/favorite-list-service';
import type { FavoriteList } from '@/types/favorite-list';
import { Flame, Star, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TrendingListsWidget() {
    const { t } = useTranslation('problems');
    const [lists, setLists] = useState<FavoriteList[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const data = await favoriteListService.getPublicLists(5, 'trending');
                setLists(data);
            } catch (error) {
                console.error('Failed to fetch trending lists', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLists();
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="flex items-center justify-center gap-2 text-md font-semibold">
                        {t('trending_lists', 'Trending Lists')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="h-10 w-10 rounded-lg bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-muted" />
                                <div className="h-3 w-1/2 rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (lists.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="py-3 !pb-3 border-b text-center">
                <CardTitle className="flex items-center justify-center text-md font-semibold w-full">
                    {t('trending_lists', 'Trending Lists')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col">
                    {lists.map((list) => (
                        <Link
                            key={list.id}
                            href={`/problems/collection/${list.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                            {list.icon.startsWith('http') ? (
                                <img
                                    src={list.icon}
                                    alt={list.name}
                                    className="h-8 w-8 rounded-lg object-cover bg-muted"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-xl">
                                    {list.icon}
                                </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                <h4 className="font-medium text-sm truncate leading-none">{list.name}</h4>
                                <div className="flex">
                                    <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[10px] font-normal h-5">
                                        {list.problems?.length || 0} problems
                                    </Badge>
                                    <Badge variant="secondary" className="ml-1 rounded-md px-1.5 py-0 text-[10px] font-normal h-5 flex items-center gap-1">
                                        <Bookmark className="h-3 w-3" />
                                        {list.savedCount || 0}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
