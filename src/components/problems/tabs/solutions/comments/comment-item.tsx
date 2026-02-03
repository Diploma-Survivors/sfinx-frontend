'use client';

import { useDialog } from '@/components/providers/dialog-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/app-context';
import { SolutionsService } from '@/services/solutions-service';
import type { SolutionComment } from '@/types/solutions';
import { SolutionCommentVoteType } from '@/types/solutions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CommentItemProps {
  comment: SolutionComment;
  solutionId: string;
  onReplySuccess: (newComment: SolutionComment) => void;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

export default function CommentItem({
  comment: initialComment,
  solutionId,
  onReplySuccess,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const { user } = useApp();
  const { confirm } = useDialog();
  const { t } = useTranslation('problems');
  const [comment, setComment] = useState(initialComment);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(initialComment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const isAuthor = user?.id === comment.authorId;

  const handleVote = async (voteType: SolutionCommentVoteType) => {
    try {
      if (comment.userVote === voteType) {
        await SolutionsService.unreactComment(comment.id);
        setComment((prev) => ({
          ...prev,
          userVote: null,
          upvoteCount:
            voteType === SolutionCommentVoteType.UPVOTE
              ? prev.upvoteCount - 1
              : prev.upvoteCount,
          downvoteCount:
            voteType === SolutionCommentVoteType.DOWNVOTE
              ? prev.downvoteCount - 1
              : prev.downvoteCount,
        }));
      } else {
        await SolutionsService.reactComment(comment.id, voteType);
        setComment((prev) => ({
          ...prev,
          userVote: voteType,
          upvoteCount:
            voteType === SolutionCommentVoteType.UPVOTE
              ? prev.upvoteCount + 1
              : prev.userVote === SolutionCommentVoteType.UPVOTE
                ? prev.upvoteCount - 1
                : prev.upvoteCount,
          downvoteCount:
            voteType === SolutionCommentVoteType.DOWNVOTE
              ? prev.downvoteCount + 1
              : prev.userVote === SolutionCommentVoteType.DOWNVOTE
                ? prev.downvoteCount - 1
                : prev.downvoteCount,
        }));
      }
    } catch (error) {
      console.error('Error voting comment:', error);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const response = await SolutionsService.createComment(
        solutionId,
        replyContent,
        comment.id
      );
      onReplySuccess(response.data.data);
      setIsReplying(false);
      setReplyContent('');
    } catch (error) {
      console.error('Error replying:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const response = await SolutionsService.updateComment(
        comment.id,
        editContent
      );
      const updatedComment = response.data.data;
      setComment(updatedComment);
      onUpdate(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    const result = await confirm({
      title: t('delete_comment'),
      message: t('confirm_delete_comment'),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      color: 'red',
    });

    if (result) {
      try {
        await SolutionsService.deleteComment(comment.id);
        onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  return (
    <div className="flex gap-3 group">
      <Avatar
        userId={comment.authorId}
        className="w-8 h-8 border border-slate-200 dark:border-slate-700 mt-1"
      >
        <AvatarImage src={comment.author?.avatarUrl} />
        <AvatarFallback>
          <img
            src="/avatars/placeholder.png"
            alt={comment.author?.username || t('user_fallback')}
            className="w-full h-full object-cover"
          />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {comment.author?.username}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-slate-400 italic">({t('edited')})</span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleEditSubmit}
                disabled={!editContent.trim() || isSubmittingEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmittingEdit ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(SolutionCommentVoteType.UPVOTE)}
              className={`flex cursor-pointer items-center gap-1 hover:text-green-600 transition-colors ${
                comment.userVote === SolutionCommentVoteType.UPVOTE
                  ? 'text-green-600'
                  : ''
              }`}
            >
              <ArrowBigUp
                className={`w-4 h-4 ${
                  comment.userVote === SolutionCommentVoteType.UPVOTE
                    ? 'fill-current'
                    : ''
                }`}
              />
              <span>{comment.upvoteCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(SolutionCommentVoteType.DOWNVOTE)}
              className={`flex cursor-pointer items-center gap-1 hover:text-red-600 transition-colors ${
                comment.userVote === SolutionCommentVoteType.DOWNVOTE
                  ? 'text-red-600'
                  : ''
              }`}
            >
              <ArrowBigDown
                className={`w-4 h-4 ${
                  comment.userVote === SolutionCommentVoteType.DOWNVOTE
                    ? 'fill-current'
                    : ''
                }`}
              />
              <span>{comment.downvoteCount}</span>
            </button>
          </div>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="cursor-pointer flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('reply')}</span>
          </button>

          {isAuthor && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="cursor-pointer flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{t('edit')}</span>
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('delete')}</span>
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              value={replyContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReplyContent(e.target.value)
              }
              placeholder={t('write_reply')}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? t('sending') : t('reply')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
