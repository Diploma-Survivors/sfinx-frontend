'use client';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useComments } from '@/hooks/use-comments';
import { ProblemCommentSortBy, ProblemCommentType } from '@/types/comments';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  Clock,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInput } from './comment-input';
import ProblemCommentItem from './problem-comment-item';
import { ReportModal } from './report-modal';

interface ProblemDiscussionProps {
  problemId: string;
}

export function ProblemDiscussion({ problemId }: ProblemDiscussionProps) {
  const { t } = useTranslation('problems');
  const [isOpen, setIsOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);

  const {
    comments,
    meta,
    isLoading,
    page,
    setPage,
    sortBy,
    setSortBy,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    unvoteComment,
    reportComment,
    fetchReplies,
  } = useComments(problemId);

  const handleCreateComment = async (
    content: string,
    type: ProblemCommentType
  ) => {
    await createComment({ content, type });
  };

  const handleReportSubmit = async (reason: string, description: string) => {
    if (reportCommentId) {
      await reportComment(reportCommentId, { reason, description });
      setReportCommentId(null);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-border"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left hover:bg-muted/50 transition-colors px-1 rounded-lg">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <MessageSquare className="w-4 h-4" />
          <span>
            {t('discussion_title')} ({meta?.total || 0})
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-4 pt-2 px-1 space-y-4">
          <div className="flex justify-end items-center mb-4">
            <div className="text-sm text-muted-foreground mr-2">
              {t('sort_by')}:
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>
                    {sortBy === ProblemCommentSortBy.NEWEST
                      ? t('sort_newest')
                      : sortBy === ProblemCommentSortBy.OLDEST
                        ? t('sort_oldest')
                        : t('sort_most_voted')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSortBy(ProblemCommentSortBy.TOP)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('sort_most_voted')}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy(ProblemCommentSortBy.NEWEST)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{t('sort_newest')}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy(ProblemCommentSortBy.OLDEST)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{t('sort_oldest')}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CommentInput onSubmit={handleCreateComment} />

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border/50"
                >
                  <ProblemCommentItem
                    comment={comment}
                    problemId={problemId}
                    onReply={createComment}
                    onUpdate={updateComment}
                    onDelete={deleteComment}
                    onVote={(id, voteType) => voteComment(id, { voteType })}
                    onUnvote={unvoteComment}
                    onReport={setReportCommentId}
                    fetchReplies={fetchReplies}
                  />
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {t('no_comments')}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!meta.hasPreviousPage}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('previous')}
                  </Button>
                  <span className="flex items-center px-2 text-sm text-muted-foreground">
                    {t('page_of', {
                      current: meta.page,
                      total: meta.totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                  >
                    {t('next')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>

      <ReportModal
        isOpen={!!reportCommentId}
        onClose={() => setReportCommentId(null)}
        onSubmit={handleReportSubmit}
      />
    </Collapsible>
  );
}
