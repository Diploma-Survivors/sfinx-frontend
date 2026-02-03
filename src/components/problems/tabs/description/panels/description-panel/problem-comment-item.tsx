'use client';

import { useDialog } from '@/components/providers/dialog-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/app-context';
import {
  type CreateProblemCommentRequest,
  type ProblemComment,
  ProblemCommentType,
  ProblemCommentVoteType,
  type UpdateProblemCommentRequest,
} from '@/types/comments';
import { formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import {
  ArrowBigDown,
  ArrowBigUp,
  ChevronUp,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInput } from './comment-input';

interface ProblemCommentItemProps {
  comment: ProblemComment;
  problemId: string | number;
  onReply: (
    data: CreateProblemCommentRequest
  ) => Promise<ProblemComment | void>;
  onUpdate: (
    id: number,
    data: UpdateProblemCommentRequest
  ) => Promise<ProblemComment | void>;
  onDelete: (id: number, parentId?: number | null) => Promise<void>;
  onVote: (id: number, voteType: ProblemCommentVoteType) => Promise<void>;
  onUnvote: (id: number) => Promise<void>;
  onReport: (id: number) => void;
  fetchReplies: (id: number) => Promise<void>;
}

const locales: Record<string, any> = {
  en: enUS,
  vi: vi,
};

export default function ProblemCommentItem({
  comment,
  problemId,
  onReply,
  onUpdate,
  onDelete,
  onVote,
  onUnvote,
  onReport,
  fetchReplies,
}: ProblemCommentItemProps) {
  const { user } = useApp();
  const { confirm } = useDialog();
  const { t, i18n } = useTranslation('problems');
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = user?.id === comment.author.id;

  const handleVote = async (type: ProblemCommentVoteType) => {
    if (comment.userVote === type) {
      await onUnvote(comment.id);
    } else {
      await onVote(comment.id, type);
    }
  };

  const handleReplySubmit = async (
    content: string,
    type: ProblemCommentType
  ) => {
    await onReply({
      content,
      type,
      parentId: comment.id,
    });
    setIsReplying(false);
    setShowReplies(true);
  };

  const handleEditSubmit = async (
    content: string,
    type: ProblemCommentType
  ) => {
    await onUpdate(comment.id, {
      content,
      type,
    });
    setIsEditing(false);
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
      await onDelete(comment.id, comment.parentId);
    }
  };

  const getTypeColor = (type: ProblemCommentType) => {
    switch (type) {
      case ProblemCommentType.QUESTION:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case ProblemCommentType.TIP:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case ProblemCommentType.FEEDBACK:
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 group">
        <Avatar
          userId={comment.author.id}
          className="w-8 h-8 border border-slate-200 dark:border-slate-700 mt-1"
        >
          <AvatarImage src={comment.author?.avatarUrl} />
          <AvatarFallback>
            {comment.author?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {comment.author?.username}
              </span>
              {comment.author?.isPremium && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  Premium
                </Badge>
              )}
              <span className="text-slate-500 dark:text-slate-400">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: locales[i18n.language] || enUS,
                })}
              </span>
              {comment.isEdited && (
                <span className="text-slate-400 italic">({t('edited')})</span>
              )}
              <Badge
                variant="outline"
                className={`h-5 px-1.5 text-[10px] font-normal ${getTypeColor(
                  comment.type
                )}`}
              >
                {t(comment.type.toLowerCase())}
              </Badge>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReport(comment.id)}>
                  <Flag className="w-4 h-4 mr-2" />
                  {t('report')}
                </DropdownMenuItem>
                {isAuthor && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <CommentInput
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              initialContent={comment.content}
              initialType={comment.type}
            />
          ) : (
            <div className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(ProblemCommentVoteType.UPVOTE)}
                className={`flex cursor-pointer items-center gap-1 hover:text-green-600 transition-colors ${
                  comment.userVote === ProblemCommentVoteType.UPVOTE
                    ? 'text-green-600'
                    : ''
                }`}
              >
                <ArrowBigUp
                  className={`w-4 h-4 ${
                    comment.userVote === ProblemCommentVoteType.UPVOTE
                      ? 'fill-current'
                      : ''
                  }`}
                />
                <span>{comment.upvoteCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(ProblemCommentVoteType.DOWNVOTE)}
                className={`flex cursor-pointer items-center gap-1 hover:text-red-600 transition-colors ${
                  comment.userVote === ProblemCommentVoteType.DOWNVOTE
                    ? 'text-red-600'
                    : ''
                }`}
              >
                <ArrowBigDown
                  className={`w-4 h-4 ${
                    comment.userVote === ProblemCommentVoteType.DOWNVOTE
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
          </div>

          {isReplying && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <CommentInput
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                isReply
                initialType={comment.type}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recursive Replies */}
      {(comment.replyCount > 0 ||
        (comment.replies && comment.replies.length > 0)) && (
        <div className="pl-11 space-y-4">
          {!showReplies ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!comment.replies || comment.replies.length === 0) {
                  await fetchReplies(comment.id);
                }
                setShowReplies(true);
              }}
              className="text-muted-foreground h-auto p-0 hover:bg-transparent hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4 mr-1" />
              {t('view_replies', { count: comment.replyCount })}
            </Button>
          ) : (
            <>
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="relative">
                  {/* Connecting line for nested replies */}
                  <div className="absolute -left-6 top-0 bottom-0 w-px bg-border/50" />
                  <ProblemCommentItem
                    comment={reply}
                    problemId={problemId}
                    onReply={onReply}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onVote={onVote}
                    onUnvote={onUnvote}
                    onReport={onReport}
                    fetchReplies={fetchReplies}
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(false)}
                className="text-muted-foreground h-auto p-0 hover:bg-transparent hover:text-foreground mt-2"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                {t('hide_replies')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
