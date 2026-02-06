import { cn } from '@/lib/utils';

interface DiscussSkeletonProps {
    count?: number;
    className?: string;
}

export function PostCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-2xl border border-border/40 bg-card/50 p-6 animate-pulse", className)}>
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted/50" />

                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-muted/50 rounded" />
                        <div className="h-3 w-3 bg-muted/50 rounded-full" />
                        <div className="h-3 w-16 bg-muted/50 rounded" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-6 w-3/4 bg-muted/50 rounded" />
                        <div className="h-4 w-full bg-muted/50 rounded" />
                        <div className="h-4 w-5/6 bg-muted/50 rounded" />
                    </div>

                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted/50 rounded-full" />
                        <div className="h-6 w-20 bg-muted/50 rounded-full" />
                        <div className="h-6 w-16 bg-muted/50 rounded-full" />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="h-4 w-12 bg-muted/50 rounded" />
                        <div className="h-4 w-16 bg-muted/50 rounded" />
                        <div className="h-4 w-20 bg-muted/50 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DiscussListSkeleton({ count = 3, className }: DiscussSkeletonProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function DiscussFilterBarSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-4 animate-pulse", className)}>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="h-10 w-full sm:max-w-[300px] bg-muted/50 rounded-lg" />
                    <div className="h-10 w-full sm:max-w-[200px] bg-muted/50 rounded-lg" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="h-9 w-32 bg-muted/50 rounded-lg" />
                    <div className="h-9 w-20 bg-muted/50 rounded-lg" />
                    <div className="h-9 w-28 bg-muted/50 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function CommentItemSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("flex gap-4 p-4 rounded-xl animate-pulse", className)}>
            <div className="w-8 h-8 rounded-full bg-muted/50 flex-shrink-0" />

            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-muted/50 rounded" />
                    <div className="h-3 w-16 bg-muted/50 rounded" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/50 rounded" />
                    <div className="h-4 w-4/5 bg-muted/50 rounded" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-3 w-12 bg-muted/50 rounded" />
                    <div className="h-3 w-12 bg-muted/50 rounded" />
                </div>
            </div>
        </div>
    );
}

export function CommentListSkeleton({ count = 3, className }: DiscussSkeletonProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <CommentItemSkeleton key={i} />
            ))}
        </div>
    );
}

export function DiscussDetailSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-6 animate-pulse", className)}>
            <div className="rounded-2xl border border-border/40 bg-card/50 p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-muted/50" />

                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted/50 rounded" />
                        <div className="h-4 w-24 bg-muted/50 rounded" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-muted/50 rounded" />

                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted/50 rounded" />
                        <div className="h-4 w-full bg-muted/50 rounded" />
                        <div className="h-4 w-5/6 bg-muted/50 rounded" />
                        <div className="h-4 w-4/5 bg-muted/50 rounded" />
                    </div>

                    <div className="h-48 w-full bg-muted/50 rounded-lg" />

                    <div className="flex gap-2 pt-4">
                        <div className="h-6 w-20 bg-muted/50 rounded-full" />
                        <div className="h-6 w-24 bg-muted/50 rounded-full" />
                        <div className="h-6 w-16 bg-muted/50 rounded-full" />
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-border/40">
                        <div className="h-4 w-16 bg-muted/50 rounded" />
                        <div className="h-4 w-20 bg-muted/50 rounded" />
                        <div className="h-4 w-24 bg-muted/50 rounded" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                <div className="h-6 w-32 bg-muted/50 rounded mb-4" />
                <CommentListSkeleton count={2} />
            </div>
        </div>
    );
}

export function TrendingTopicsSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-2xl border border-border/40 bg-card/50 p-6 animate-pulse", className)}>
            <div className="h-6 w-40 bg-muted/50 rounded mb-4" />

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted/50 rounded" />
                            <div className="h-4 w-24 bg-muted/50 rounded" />
                        </div>
                        <div className="h-4 w-8 bg-muted/50 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
