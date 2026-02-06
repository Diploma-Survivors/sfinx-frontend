import { PostCard } from '@/components/discuss/posts/post-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Post } from '@/services/discuss-service';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserDiscussListProps {
    posts: Post[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function UserDiscussList({
    posts,
    loading,
    currentPage,
    totalPages,
    onPageChange,
}: UserDiscussListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No discussions yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
