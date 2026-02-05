import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiscussService, type Post } from '@/services/discuss-service';
import { ArrowUp, Eye, MessageSquare, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const [upvotes, setUpvotes] = useState(post.upvoteCount);
    const [hasVoted, setHasVoted] = useState(false);

    const getDisplayName = () => {
        return post.author.fullName || post.author.username || 'Anonymous';
    };

    const getAvatarUrl = () => {
        if (!post.author.avatarKey) return null;
        return `${process.env.NEXT_PUBLIC_S3_URL}/${post.author.avatarKey}`;
    };

    const handleUpvote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newHasVoted = !hasVoted;
        setHasVoted(newHasVoted);
        setUpvotes(prev => newHasVoted ? prev + 1 : prev - 1);

        try {
            await DiscussService.votePost(post.id, newHasVoted ? 'up' : 'down');
        } catch (error) {
            setHasVoted(!newHasVoted);
            setUpvotes(prev => !newHasVoted ? prev + 1 : prev - 1);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="group border-b border-border py-4 px-2 hover:bg-muted/30 transition-colors first:pt-2">
            <Link href={`/discuss/${post.id}`} className="block space-y-3">
                {/* Header: Avatar, Name, Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getAvatarUrl() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getAvatarUrl()!} alt={getDisplayName()} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                                {getDisplayName().charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                            {getDisplayName()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            • {getTimeAgo(post.createdAt)}
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Title & Content */}
                <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                        {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content.replace(/[#*`_]/g, '').substring(0, 200)}...
                    </p>
                </div>

                {/* Footer: Tags & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="px-2 py-0.5 text-xs font-normal text-muted-foreground bg-muted hover:bg-muted/80">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4" />
                            <span>{upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentCount}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
