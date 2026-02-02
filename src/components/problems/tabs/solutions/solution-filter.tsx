'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { useApp } from '@/contexts/app-context';
import { useProblemDetail } from '@/contexts/problem-detail-context';
import { SubmissionsService } from '@/services/submissions-service';
import { TagsService } from '@/services/tags-service';
import { toastService } from '@/services/toasts-service';
import { SolutionSortBy } from '@/types/solutions';
import type { Language } from '@/types/submissions';
import type { Tag } from '@/types/tags';
import {
  ArrowDownWideNarrow,
  ChevronDown,
  Filter,
  PenSquare,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProblemStats from '../../problems-stats/problem-stats';
import { ProblemStatus } from '@/types/problems';

interface SolutionFilterProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  onSearch: () => void;
  sortBy: SolutionSortBy;
  onSortChange: (val: SolutionSortBy) => void;
  selectedTags: number[];
  onTagsChange: (ids: number[]) => void;
  selectedLanguages: number[];
  onLanguagesChange: (ids: number[]) => void;
  submissionId?: string | null;
  problemId?: string;
}

export default function SolutionFilter({
  keyword,
  onKeywordChange,
  onSearch,
  sortBy,
  onSortChange,
  selectedTags,
  onTagsChange,
  selectedLanguages,
  onLanguagesChange,
  submissionId,
  problemId,
}: SolutionFilterProps) {
  const { t } = useTranslation('problems');
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);
  const { problem } = useProblemDetail();
  const { isLoggedin, isEmailVerified } = useApp();
  const { t: tCommon } = useTranslation('common');

  useEffect(() => {
    TagsService.getAllTags().then(setTags);
    const getLanguageList = async () => {
      const response = await SubmissionsService.getLanguageList();
      setLanguages(response);
    };
    getLanguageList();
  }, []);

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      onTagsChange(selectedTags.filter((t) => t !== id));
    } else {
      onTagsChange([...selectedTags, id]);
    }
  };

  const toggleLang = (id: number) => {
    if (selectedLanguages.includes(id)) {
      onLanguagesChange(selectedLanguages.filter((l) => l !== id));
    } else {
      onLanguagesChange([...selectedLanguages, id]);
    }
  };

  const displayedTags = showAllTags ? tags : tags.slice(0, 10);
  const displayedLangs = showAllLangs ? languages : languages.slice(0, 10);

  return (
    <div className="space-y-4 p-4 border-b border-slate-200 dark:border-slate-700">
      {/* Top Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder={t('search_solutions')}
            className="pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        {problem?.status === ProblemStatus.SOLVED && (
          <Tooltip content={t('share_solution')}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => {
                if (!isLoggedin) {
                  toastService.error(tCommon('login_required_action'));
                  return;
                }
                if (!isEmailVerified) {
                  toastService.error(
                    tCommon('email_verification_required_action')
                  );
                  return;
                }
                window.open(
                  `/problems/${problemId}/solutions/create/${submissionId}`,
                  '_blank'
                );
              }}
            >
              <PenSquare className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <ArrowDownWideNarrow className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onSortChange(SolutionSortBy.RECENT)}
            >
              {t('sort_newest')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(SolutionSortBy.MOST_VOTED)}
            >
              {t('sort_most_voted')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
          {/* Languages */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('language')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedLangs.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => toggleLang(lang.id)}
                  className={`px-3 py-1 cursor-pointer rounded-full text-xs font-medium transition-colors border ${
                    selectedLanguages.includes(lang.id)
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
              {languages.length > 10 && (
                <button
                  onClick={() => setShowAllLangs(!showAllLangs)}
                  className="text-xs cursor-pointer text-blue-600 dark:text-blue-400 hover:underline px-2"
                >
                  {showAllLangs ? t('show_less') : t('show_more')}
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('tags')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 cursor-pointer py-1 rounded-full text-xs font-medium transition-colors border ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length > 10 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2"
                >
                  {showAllTags ? t('show_less') : t('show_more')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
