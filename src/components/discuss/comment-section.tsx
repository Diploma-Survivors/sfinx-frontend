'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment } from '@/services/discuss-service';
import { MessageSquare, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

interface CommentSectionProps {
    comments?: Comment[]; // In real implementation, fetching might be separate or passed down
    postId: string;
}

export function CommentSection({ comments = [], postId }: CommentSectionProps) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit comment for post', postId, commentText);
        setCommentText('');
        // Here we would call the service to add comment
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Comments
                    <span className="text-muted-foreground text-base font-normal">({comments.length})</span>
                </h3>
            </div>

            {/* Comment Input */}
            <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                    {/* Current user avatar placeholder */}
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <Textarea
                        placeholder="What are your thoughts?"
                        className="min-h-[100px] resize-y bg-background"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={!commentText.trim()}>
                            Comment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{comment.author.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="text-sm text-foreground/90">
                                <MarkdownRenderer content={comment.content} />
                            </div>

                            <div className="flex items-center gap-4 pt-1">
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground gap-1.5 font-normal">
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span className="text-xs">{comment.upvotes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-foreground gap-1.5 font-normal">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span className="text-xs">Reply</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}
