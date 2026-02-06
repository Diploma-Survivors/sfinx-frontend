'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { DiscussService, type Comment } from '@/services/discuss-service';
import { useApp } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, ArrowBigUp, ArrowBigDown, ChevronDown, ChevronUp, Reply, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toastService } from '@/services/toasts-service';
import { CommentForm } from './comment-discuss/comment-form';
import { DeleteCommentDialog } from './delete-comment-dialog';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
    comment: Comment;
    postId: string;
    onReplySuccess: () => void;
    onDeleteSuccess: () => void;
    depth?: number;
    isLast?: boolean;
    rootId?: number; // Added rootId prop
}

export function CommentItem({
    comment,
    postId,
    onReplySuccess,
    onDeleteSuccess,
    depth = 0,
    isLast = false,
    rootId,
}: CommentItemProps) {
    const { user } = useApp();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userVote, setUserVote] = useState<number | null>(comment.userVote || null);
    const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount);
    // Initialize to false to hide replies by default
    const [areRepliesExpanded, setAreRepliesExpanded] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Identify the root ID (level 0 comment ID)
    const currentRootId = depth === 0 ? comment.id : rootId;

    const isAuthor = user?.id === comment.author.id;
    const getAvatarUrl = () => comment.author.avatarUrl || (comment.author.avatarKey ? `${process.env.NEXT_PUBLIC_S3_URL}/${comment.author.avatarKey}` : undefined);
    const getDisplayName = () => comment.author.fullName || comment.author.username || 'Anonymous';

    // LeetCode style: relative time
    const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    // Fetch user vote on mount
    useEffect(() => {
        const fetchVote = async () => {
            if (user) {
                const vote = await DiscussService.getUserVoteForComment(comment.id);
                setUserVote(vote);
            }
        };
        fetchVote();
    }, [comment.id, user]);

    const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
        if (!user) {
            toastService.error('Please login to vote');
            return;
        }

        const voteValue = type === 'UPVOTE' ? 1 : -1;
        // Optimistic update
        const previousVote = userVote;
        const previousUpvoteCount = upvoteCount;

        // Toggle logic: if clicking same vote, it toggles off (becomes null)
        // If clicking different vote, it switches
        let newVote: number | null = voteValue;
        if (userVote === voteValue) {
            newVote = null;
        }

        setUserVote(newVote);

        // Update counts optimistically
        // Only tracking upvotes mostly based on UI, but let's try to be accurate
        // If we toggled OFF upvote -> decrement
        // If we toggled ON upvote -> increment
        // If we switched from downvote to upvote -> increment
        // If we switched from upvote to downvote -> decrement

        if (type === 'UPVOTE') {
            if (userVote === 1) {
                // Toggling off upvote
                setUpvoteCount(prev => Math.max(0, prev - 1));
            } else {
                // Toggling on upvote (from null or downvote)
                setUpvoteCount(prev => prev + 1);
            }
        } else {
            // Downvote logic affecting upvote count?
            // Usually downvotes don't affect upvote count unless we show a score (up-down).
            // But if we switch from Upvote to Downvote, upvote count should decrease.
            if (userVote === 1) {
                setUpvoteCount(prev => Math.max(0, prev - 1));
            }
        }

        try {
            if (newVote === null) {
                await DiscussService.unvoteComment(comment.id);
            } else {
                await DiscussService.voteComment(comment.id, voteValue);
            }
        } catch (error) {
            // Revert on error
            setUserVote(previousVote);
            setUpvoteCount(previousUpvoteCount);
            toastService.error('Failed to vote');
        }
    };

    const handleReply = async (content: string) => {
        const targetParentId = depth === 0 ? comment.id : currentRootId;

        if (!targetParentId) {
            toastService.error("Error: Missing parent context");
            return;
        }

        // Transform plain @username to markdown link if present at the start
        let finalContent = content;
        if (comment.author.username && content.startsWith(`@${comment.author.username} `)) {
            const link = `[@${comment.author.username}](/profile/${comment.author.id}) `;
            finalContent = content.replace(`@${comment.author.username} `, link);
        }

        await DiscussService.createComment(postId, finalContent, targetParentId);
        setIsReplying(false);
        setAreRepliesExpanded(true); // Auto-expand to show new reply
        onReplySuccess();
        toastService.success('Reply posted');
    };

    // Helper to extract mentions and their links from the ORIGINAL content
    const extractMentions = (text: string) => {
        const mentions = new Map<string, string>();
        const regex = /\[(@[^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            // match[1] is @username, match[2] is the link (e.g. /profile/1)
            // We verify it starts with @ just to be safe based on regex
            if (match[1].startsWith('@')) {
                mentions.set(match[1], match[2]);
            }
        }
        return mentions;
    };

    // Helper to simplify content for display in the textarea (remove links)
    const simplifyContent = (text: string) => {
        return text.replace(/\[(@[^\]]+)\]\(([^)]+)\)/g, '$1');
    };

    // Helper to restore links to mentions before saving
    const restoreContent = (text: string, originalText: string) => {
        const knownMentions = extractMentions(originalText);
        let restored = text;

        knownMentions.forEach((link, username) => {
            // Escape special chars for regex logic to be safe
            const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Ensure we match the whole username (add boundary at the end to avoid matching @user in @username)
            const mentionRegex = new RegExp(escapedUsername + '\\b', 'g');
            restored = restored.replace(mentionRegex, `[${username}](${link})`);
        });

        return restored;
    };

    const handleEdit = async (content: string) => {
        // Restore mentions based on the original comment content
        const finalContent = restoreContent(content, comment.content);

        await DiscussService.updateComment(comment.id, finalContent);
        setIsEditing(false);
        onReplySuccess();
        toastService.success('Comment updated');
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await DiscussService.deleteComment(comment.id);
            onDeleteSuccess();
            toastService.success('Comment deleted');
        } catch (error) {
            toastService.error('Failed to delete comment');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Pre-fill @Username as plain text for clean UX
    const replyInitialValue = comment.author.username
        ? `@${comment.author.username} `
        : '';

    return (
        <div className={cn(
            "relative animate-in fade-in slide-in-from-top-1",
            depth > 0 ? "mt-4" : "py-4 border-b border-border/40 last:border-0"
        )}>
            <div className={cn(
                "group flex gap-4 p-3 rounded-xl transition-all",
                depth > 0 ? "bg-muted/30 border border-border/40 hover:bg-muted/60" : "hover:bg-muted/40"
            )}>
                {/* Avatar Column */}
                <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-border/50 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                        <AvatarFallback className="bg-muted text-xs sm:text-sm font-medium text-muted-foreground">
                            {getDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className={cn(
                                "font-semibold transition-colors",
                                comment.isDeleted ? "text-muted-foreground italic" : "text-foreground hover:text-primary cursor-pointer"
                            )}>
                                {comment.isDeleted ? "Deleted" : getDisplayName()}
                            </span>

                            <span className="text-muted-foreground text-xs">
                                {formattedDate}
                            </span>
                            {!comment.isDeleted && comment.isEdited && (
                                <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    {isEditing ? (
                        <div className="mt-2">
                            <CommentForm
                                onSubmit={handleEdit}
                                onCancel={() => setIsEditing(false)}
                                placeholder="Edit your comment..."
                                submitLabel="Save"
                                autoFocus
                                initialValue={simplifyContent(comment.content)}
                                showAvatar={false}
                            />
                        </div>
                    ) : (
                        <div className="mt-1 text-sm text-foreground/90 prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                            {comment.isDeleted ? (
                                <span className="text-muted-foreground italic">This comment has been deleted.</span>
                            ) : (
                                <MarkdownRenderer content={comment.content} />
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    {!isEditing && !comment.isDeleted && (
                        <div className="flex items-center gap-6 pt-2">
                            {/* Vote Buttons */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-6 px-1.5 text-muted-foreground hover:text-foreground gap-1 hover:bg-transparent p-0",
                                        userVote === 1 && "text-green-600 hover:text-green-700"
                                    )}
                                    onClick={() => handleVote('UPVOTE')}
                                >
                                    <ArrowBigUp className={cn("h-5 w-5", userVote === 1 && "fill-current")} />
                                    <span className="text-xs font-medium min-w-[1ch]">{upvoteCount}</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-6 px-1 text-muted-foreground hover:text-foreground hover:bg-transparent p-0",
                                        userVote === -1 && "text-blue-500 hover:text-blue-600"
                                    )}
                                    onClick={() => handleVote('DOWNVOTE')}
                                >
                                    <ArrowBigDown className={cn("h-5 w-5", userVote === -1 && "fill-current")} />
                                </Button>
                            </div>

                            {/* Hide/Show Replies - Inline */}
                            {comment.replies && comment.replies.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAreRepliesExpanded(!areRepliesExpanded)}
                                    className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    {areRepliesExpanded ? "Hide Replies" : `Show ${comment.replies.length} Replies`}
                                </Button>
                            )}


                            {/* Reply Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent"
                                onClick={() => setIsReplying(!isReplying)}
                            >
                                <Reply className="h-4 w-4" />
                                Reply
                            </Button>

                            {/* Edit (if author) */}
                            {isAuthor && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="h-6 px-0 text-muted-foreground hover:text-foreground gap-1.5 font-medium text-xs hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                            )}

                            {/* Delete (if author) */}
                            {isAuthor && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="h-6 px-0 text-muted-foreground hover:text-destructive gap-1.5 font-medium text-xs hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-4 pl-0">
                            <CommentForm
                                onSubmit={handleReply}
                                onCancel={() => setIsReplying(false)}
                                placeholder={`Reply to ${getDisplayName()}...`}
                                submitLabel="Reply"
                                autoFocus
                                initialValue={replyInitialValue}
                                className="animate-in fade-in slide-in-from-top-2"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className={cn(
                    "mt-2 pl-4 sm:pl-14 transition-all duration-300 ease-in-out",
                    !areRepliesExpanded && "hidden"
                )}>
                    {areRepliesExpanded && (
                        <div className="space-y-4">
                            {comment.replies.map((reply, index) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    onReplySuccess={onReplySuccess}
                                    onDeleteSuccess={onDeleteSuccess}
                                    depth={depth + 1}
                                    isLast={index === comment.replies!.length - 1}
                                    rootId={currentRootId} // Pass down the rootId
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <DeleteCommentDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />

        </div>
    );
}
