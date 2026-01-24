'use client';

import { CommentSection } from '@/components/discuss/comment-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { DiscussService, type Post } from '@/services/discuss-service';
import { ArrowLeft, Bookmark, Flag, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscussDetailProps {
    postId: string;
}

export function DiscussDetail({ postId }: DiscussDetailProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                const data = await DiscussService.getPostById(postId);
                setPost(data);
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

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
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Back Button */}
            <Link href="/discuss" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discussions
            </Link>

            {/* Header */}
            <div className="space-y-4">
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

                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        {post.author.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-border" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                                {post.author.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">{post.author.name}</div>
                            <div className="text-sm text-muted-foreground">
                                Posted {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-4 py-8 border-y border-border">
                <div className="flex items-center bg-muted/50 rounded-lg p-1">
                    <Button variant="ghost" size="sm" className="hover:bg-background hover:shadow-sm">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Upvote ({post.upvotes})
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-background hover:shadow-sm">
                        <ThumbsDown className="w-4 h-4" />
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
