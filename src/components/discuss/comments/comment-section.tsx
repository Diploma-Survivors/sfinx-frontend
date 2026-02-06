'use client';

import { DiscussService } from '@/services/discuss-service';
import type { Comment } from '@/types/discuss';
import { useCallback, useEffect, useState } from 'react';
import { CommentForm } from './comment-discuss/comment-form';
import { CommentList } from './comment-discuss/comment-list';
import { toastService } from '@/services/toasts-service';
import { ChevronDown } from 'lucide-react';

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        try {
            const data = await DiscussService.getComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            toastService.error('Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (content: string) => {
        await DiscussService.createComment(postId, content);
        toastService.success('Comment posted successfully');
        fetchComments(); // Refresh list to show new comment
    };

    const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replyCount || 0), 0);

    return (
        <div className="space-y-6 pt-8 border-t border-border mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    Comments
                    {!isLoading && (
                        <span className="text-muted-foreground text-sm font-normal bg-muted px-2 py-0.5 rounded-full">
                            {totalComments}
                        </span>
                    )}
                </h3>

                {/* Sort Dropdown Placeholder */}
                <div className="text-sm text-foreground/80 flex items-center gap-1 cursor-pointer hover:text-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                    <span>Best</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            <CommentForm onSubmit={handlePostComment} className="mb-10" />

            <CommentList
                comments={comments}
                postId={postId}
                isLoading={isLoading}
                onReplySuccess={fetchComments}
                onDeleteSuccess={fetchComments}
            />
        </div>
    );
}
