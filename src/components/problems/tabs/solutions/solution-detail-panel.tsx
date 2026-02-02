'use client';

import { useDialog } from '@/components/providers/dialog-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Tooltip } from '@/components/ui/tooltip';
import { useApp } from '@/contexts/app-context';
import { SolutionsService } from '@/services/solutions-service';
import { SubmissionsService } from '@/services/submissions-service';
import { toastService } from '@/services/toasts-service';
import type { Solution } from '@/types/solutions';
import { SolutionVoteType } from '@/types/solutions';
import type { Language } from '@/types/submissions';
import { format } from 'date-fns';
import { ArrowBigDown, ArrowBigUp, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommentSection from './comments/comment-section';

interface SolutionDetailPanelProps {
  solution: Solution;
  onDelete: () => void;
}

export default function SolutionDetailPanel({
  solution: initialSolution,
  onDelete,
}: SolutionDetailPanelProps) {
  const { t } = useTranslation('problems');
  const { user } = useApp();
  const { confirm } = useDialog();
  const router = useRouter();
  const params = useParams();
  const [solution, setSolution] = useState(initialSolution);
  const [languages, setLanguages] = useState<Language[]>([]);

  const isAuthor = user?.id === solution.authorId;

  useEffect(() => {
    setSolution(initialSolution);
  }, [initialSolution]);

  useEffect(() => {
    const fetchLanguageList = async () => {
      const response = await SubmissionsService.getLanguageList();
      setLanguages(response);
    };
    fetchLanguageList();
  }, []);

  const solutionLangs = languages.filter((l) =>
    solution.languageIds.includes(l.id)
  );

  const { isLoggedin, isEmailVerified } = useApp();
  const { t: tCommon } = useTranslation('common');

  const handleVote = async (type: SolutionVoteType) => {
    if (!isLoggedin) {
      toastService.error(tCommon('login_required_action'));
      return;
    }
    if (!isEmailVerified) {
      toastService.error(tCommon('email_verification_required_action'));
      return;
    }

    try {
      if (solution.userVote === type) {
        await SolutionsService.unreactSolution(solution.id);
        setSolution((prev) => ({
          ...prev,
          userVote: null,
          upvoteCount:
            type === SolutionVoteType.UPVOTE
              ? prev.upvoteCount - 1
              : prev.upvoteCount,
          downvoteCount:
            type === SolutionVoteType.DOWNVOTE
              ? prev.downvoteCount - 1
              : prev.downvoteCount,
        }));
      } else {
        await SolutionsService.reactSolution(solution.id, type);
        setSolution((prev) => ({
          ...prev,
          userVote: type,
          upvoteCount:
            type === SolutionVoteType.UPVOTE
              ? prev.upvoteCount + 1
              : prev.userVote === SolutionVoteType.UPVOTE
                ? prev.upvoteCount - 1
                : prev.upvoteCount,
          downvoteCount:
            type === SolutionVoteType.DOWNVOTE
              ? prev.downvoteCount + 1
              : prev.userVote === SolutionVoteType.DOWNVOTE
                ? prev.downvoteCount - 1
                : prev.downvoteCount,
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async () => {
    const result = await confirm({
      title: t('delete_solution_confirm_title'),
      message: t('delete_solution_confirm_message'),
      confirmText: t('delete_solution'),
      cancelText: t('cancel_action'),
      color: 'red',
    });

    if (result) {
      try {
        await SolutionsService.deleteSolution(solution.id);
        onDelete();
      } catch (error) {
        console.error('Error deleting solution:', error);
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              userId={solution.authorId}
              className="w-10 h-10 border border-slate-200 dark:border-slate-700"
            >
              <AvatarImage src={solution.author?.avatarUrl} />
              <AvatarFallback>
                <img
                  src="/avatars/placeholder.png"
                  alt={solution.author?.username || t('user_fallback')}
                  className="w-full h-full object-cover"
                />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-200">
                {solution.author?.username}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {solution.createdAt
                  ? format(new Date(solution.createdAt), 'dd/MM/yyyy HH:mm')
                  : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <div className="flex items-center gap-2 shrink-0 mr-2">
                <Tooltip content={t('edit_solution')}>
                  <Link
                    href={`/problems/${params.id}/solutions/edit/${solution.id}`}
                    target="_blank"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                </Tooltip>
                <Tooltip content={t('delete_solution')}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(SolutionVoteType.UPVOTE)}
              className={`gap-2 ${
                solution.userVote === SolutionVoteType.UPVOTE
                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : ''
              }`}
            >
              <ArrowBigUp
                className={`w-5 h-5 ${
                  solution.userVote === SolutionVoteType.UPVOTE
                    ? 'fill-current'
                    : ''
                }`}
              />
              {solution.upvoteCount}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(SolutionVoteType.DOWNVOTE)}
              className={`gap-2 ${
                solution.userVote === SolutionVoteType.DOWNVOTE
                  ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  : ''
              }`}
            >
              <ArrowBigDown
                className={`w-5 h-5 ${
                  solution.userVote === SolutionVoteType.DOWNVOTE
                    ? 'fill-current'
                    : ''
                }`}
              />
              {solution.downvoteCount}
            </Button>
          </div>
        </div>

        {/* Tags & Languages */}
        <div className="flex flex-wrap gap-2">
          {solutionLangs.map((lang) => (
            <span
              key={lang.id}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {lang.name}
            </span>
          ))}
          {solution.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownRenderer content={solution.content} />
      </div>

      {/* Comments Section */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
        <CommentSection solutionId={solution.id} />
      </div>
    </div>
  );
}
