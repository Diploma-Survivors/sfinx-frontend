'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/app-context';
import { SolutionsService } from '@/services/solutions-service';
import { UserService } from '@/services/user-service';
import { type SolutionComment, SolutionCommentSortBy } from '@/types/solutions';
import type { UserProfile } from '@/types/user';
import { ArrowUpDown, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommentNode from './comment-node';
interface CommentSectionProps {
  solutionId: string;
}

export default function CommentSection({ solutionId }: CommentSectionProps) {
  const { user } = useApp();
  const { t } = useTranslation('problems');
  const [comments, setComments] = useState<SolutionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SolutionCommentSortBy>(
    SolutionCommentSortBy.RECENT
  );
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    // Fetch current user for the avatar in the input
    if (!user) return;
    UserService.getUserProfile(user.id).then((res) =>
      setCurrentUser(res.data.data)
    );
  }, [user]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await SolutionsService.getComments(solutionId);
      // Deduplicate comments based on ID
      const uniqueComments = Array.from(
        new Map(response.data.data.map((c) => [c.id, c])).values()
      );

      // Apply current sort
      const sorted = sortComments(uniqueComments, sortBy);
      setComments(sorted);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [solutionId]);

  const sortComments = (
    items: SolutionComment[],
    sortOption: SolutionCommentSortBy
  ) => {
    return [...items].sort((a, b) => {
      if (sortOption === SolutionCommentSortBy.RECENT) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return b.upvoteCount - a.upvoteCount;
    });
  };

  const handleSortChange = (newSort: SolutionCommentSortBy) => {
    setSortBy(newSort);
    const sorted = sortComments(comments, newSort);
    setComments(sorted);
    setCurrentPage(1); // Reset to first page on sort
  };

  const handleSubmitComment = async () => {
    if (!newCommentContent.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await SolutionsService.createComment(
        solutionId,
        newCommentContent
      );
      setComments((prev) => {
        const newComment = response.data.data;
        if (prev.some((c) => c.id === newComment.id)) return prev;
        // Add new comment and re-sort
        const newComments = [newComment, ...prev];
        return sortComments(newComments, sortBy);
      });
      setNewCommentContent('');
      setCurrentPage(1); // Go to first page to see new comment
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySuccess = (newReply: SolutionComment) => {
    setComments((prev) => {
      if (prev.some((c) => c.id === newReply.id)) return prev;
      const newComments = [...prev, newReply];
      return sortComments(newComments, sortBy);
    });
    // Auto expand the parent to show the new reply
    if (newReply.parentId) {
      const parentId = newReply.parentId;
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // Filter top-level comments for the main list
  // In a real app with nested comments, we'd likely have a recursive structure or filter by parentId === null
  const topLevelComments = comments.filter((c) => !c.parentId);
  const totalPages = Math.ceil(topLevelComments.length / ITEMS_PER_PAGE);
  const displayedComments = topLevelComments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Helper to get replies for a comment
  const getReplies = (parentId: string) => {
    return comments.filter((c) => c.parentId === parentId);
  };

  return (
    <div className="space-y-6">
      {/* Header: Count & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">
            {comments.length} {t('comments')}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-600 dark:text-slate-400"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>
                {sortBy === SolutionCommentSortBy.RECENT
                  ? t('sort_newest')
                  : t('sort_most_voted')}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleSortChange(SolutionCommentSortBy.RECENT)}
            >
              {t('sort_newest')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange(SolutionCommentSortBy.MOST_VOTED)}
            >
              {t('sort_most_voted')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Input Section */}
      <div className="flex gap-4">
        <Avatar
          userId={currentUser?.id}
          className="w-10 h-10 border border-slate-200 dark:border-slate-700"
        >
          <AvatarImage src={currentUser?.avatarUrl} />
          <AvatarFallback>
            <img
              src="/avatars/placeholder.png"
              alt={currentUser?.username || t('user_fallback')}
              className="w-full h-full object-cover"
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={t('write_comment')}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmitComment}
              disabled={!newCommentContent.trim() || isSubmitting}
            >
              {isSubmitting ? t('sending') : t('post_comment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {isLoading
          ? // Skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          : displayedComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                getReplies={getReplies}
                solutionId={solutionId}
                onReplySuccess={handleReplySuccess}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                expandedReplies={expandedReplies}
                toggleReplies={toggleReplies}
              />
            ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {t('page_of', { current: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
