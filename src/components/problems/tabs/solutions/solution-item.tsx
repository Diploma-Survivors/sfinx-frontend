'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubmissionsService } from '@/services/submissions-service';
import { type Solution, SolutionVoteType } from '@/types/solutions';
import type { Language } from '@/types/submissions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SolutionItemProps {
  solution: Solution;
  isSelected: boolean;
  onClick: () => void;
}

export default function SolutionItem({
  solution,
  isSelected,
  onClick,
}: SolutionItemProps) {
  const { t } = useTranslation('problems');
  const [languages, setLanguages] = useState<Language[]>([]);

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

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-slate-200 dark:bg-slate-800/80' : ''}`}
    >
      <div className="flex gap-4">
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

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {solution.author?.username}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(solution.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {solution.title}
          </h3>

          <div className="flex flex-wrap gap-1.5 py-1">
            {solutionLangs.map((lang) => (
              <span
                key={lang.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                {lang.name}
              </span>
            ))}
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            {solution.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1">
              <ArrowBigUp
                className={`w-4 h-4 ${
                  solution.userVote === SolutionVoteType.UPVOTE
                    ? 'fill-green-500 text-green-500'
                    : ''
                }`}
              />
              <span>{solution.upvoteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowBigDown
                className={`w-4 h-4 ${
                  solution.userVote === SolutionVoteType.DOWNVOTE
                    ? 'fill-red-500 text-red-500'
                    : ''
                }`}
              />
              <span>{solution.downvoteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{solution.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
