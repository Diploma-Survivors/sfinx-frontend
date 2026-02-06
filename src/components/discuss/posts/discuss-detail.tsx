'use client';

import { CommentSection } from '../comments/comment-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { DiscussService, type Post } from '@/services/discuss-service';
import { ArrowLeft, ArrowBigUp, ArrowBigDown, Bookmark, Flag, Share2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface DiscussDetailProps {
    postId: string;
}

export function DiscussDetail({ postId }: DiscussDetailProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userVote, setUserVote] = useState<1 | -1 | null>(null);
    const [localUpvoteCount, setLocalUpvoteCount] = useState(0);
    const [localDownvoteCount, setLocalDownvoteCount] = useState(0);
    const viewCountedRef = useRef<string | null>(null);

    const getDisplayName = () => {
        if (!post) return 'Anonymous';
        return post.author.fullName || post.author.username || 'Anonymous';
    };

    const getAvatarUrl = () => {
        if (!post?.author.avatarKey) return null;
        return `${process.env.NEXT_PUBLIC_S3_URL}/${post.author.avatarKey}`;
    };

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                const data = await DiscussService.getPostById(postId);
                setPost(data);
                setLocalUpvoteCount(data?.upvoteCount || 0);
                setLocalDownvoteCount(data?.downvoteCount || 0);

                const vote = await DiscussService.getUserVoteForPost(postId);
                setUserVote(vote);
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    useEffect(() => {
        if (viewCountedRef.current !== postId) {
            DiscussService.incrementViewCount(postId);
            viewCountedRef.current = postId;
        }
    }, [postId]);

    const handleUpvote = async () => {
        if (!post) return;

        const previousVote = userVote;
        const previousUpvoteCount = localUpvoteCount;
        const previousDownvoteCount = localDownvoteCount;

        try {
            if (userVote === 1) {
                // Already upvoted, toggle off
                setUserVote(null);
            } else if (userVote === -1) {
                // Switch from downvote to upvote
                setUserVote(1);
            } else {
                // Add new upvote
                setUserVote(1);
            }

            const { upvoteCount, downvoteCount } = await DiscussService.votePost(post.id, 1);
            setLocalUpvoteCount(upvoteCount);
            setLocalDownvoteCount(downvoteCount);
        } catch (error) {
            console.error('Failed to upvote:', error);
            setUserVote(previousVote);
            setLocalUpvoteCount(previousUpvoteCount);
            setLocalDownvoteCount(previousDownvoteCount);
        }
    };

    const handleDownvote = async () => {
        if (!post) return;

        const previousVote = userVote;
        const previousUpvoteCount = localUpvoteCount;
        const previousDownvoteCount = localDownvoteCount;

        try {
            if (userVote === -1) {
                // Already downvoted, toggle off
                setUserVote(null);
            } else if (userVote === 1) {
                // Switch from upvote to downvote
                setUserVote(-1);
            } else {
                // Add new downvote
                setUserVote(-1);
            }

            const { upvoteCount, downvoteCount } = await DiscussService.votePost(post.id, -1);
            setLocalUpvoteCount(upvoteCount);
            setLocalDownvoteCount(downvoteCount);
        } catch (error) {
            console.error('Failed to downvote:', error);
            setUserVote(previousVote);
            setLocalUpvoteCount(previousUpvoteCount);
            setLocalDownvoteCount(previousDownvoteCount);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="space-y-4">
                    <div className="h-10 w-3/4 bg-muted rounded" />
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted rounded" />
                        <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                </div>
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-bold mb-2">Post not found</h2>
                <p className="text-muted-foreground mb-6">The post you are looking for does not exist or has been removed.</p>
                <Link href="/discuss">
                    <Button variant="outline">Back to Discussions</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 pb-8">
            {/* Back Button */}
            <Link href="/discuss" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discussions
            </Link>

            {/* Header */}
            <div className="space-y-3">
                <div className="flex gap-2 mb-2">
                    {post.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary">
                            {tag.name}
                        </Badge>
                    ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        {getAvatarUrl() ? (
                            <img src={getAvatarUrl()!} alt={getDisplayName()} className="w-10 h-10 rounded-full border border-border" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                                {getDisplayName().charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">{getDisplayName()}</div>
                            <div className="text-sm text-muted-foreground">
                                Posted {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {session?.user?.id && Number(session.user.id) === post.author.id && (
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => router.push(`/discuss/${post.id}/edit`)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Save">
                            <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Report">
                            <Flag className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Share">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-stone dark:prose-invert max-w-none">
                <MarkdownRenderer content={post.content} />
            </div>

            {/* Actions (Vote) */}
            <div className="flex items-center gap-4 py-4">
                <div className="flex items-center bg-muted/50 rounded-lg p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpvote}
                        className={cn(
                            "hover:bg-background hover:shadow-sm transition-all duration-300 gap-1",
                            userVote === 1 && "text-green-600 hover:text-green-700"
                        )}
                    >
                        <ArrowBigUp className={cn("w-5 h-5", userVote === 1 && "fill-current")} />
                        <span className="text-xs font-medium min-w-[1ch]">{localUpvoteCount}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownvote}
                        className={cn(
                            "hover:bg-background hover:shadow-sm transition-all duration-300",
                            userVote === -1 && "text-blue-500 hover:text-blue-600"
                        )}
                    >
                        <ArrowBigDown className={cn("w-5 h-5", userVote === -1 && "fill-current")} />
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground ml-auto">
                    {post.viewCount} Views
                </div>
            </div>

            {/* Comments */}
            <CommentSection postId={post.id} />
        </div>
    );
}
