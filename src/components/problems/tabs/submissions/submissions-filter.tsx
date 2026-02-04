'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SubmissionsService } from '@/services/submissions-service';
import { SubmissionStatus } from '@/types/submissions';
import type { Language, SubmissionFilters } from '@/types/submissions';
import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SubmissionsFilterProps {
  onFilterChange: (filters: SubmissionFilters) => void;
  filters: SubmissionFilters;
}

export default function SubmissionsFilter({
  onFilterChange,
  filters,
}: SubmissionsFilterProps) {
  const { t } = useTranslation('problems');
  const [statusFilter, setStatusFilter] = useState<string>(
    filters.status || 'ALL'
  );
  const [languageFilter, setLanguageFilter] = useState<string>(
    filters.languageId?.toString() || 'ALL'
  );
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');

  const filteredLanguages = languageList.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Get language list
  useEffect(() => {
    const fetchLanguageList = async () => {
      const response = await SubmissionsService.getLanguageList();
      setLanguageList(response);
    };

    fetchLanguageList();
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange({
      status: value === 'ALL' ? undefined : (value as SubmissionStatus),
      languageId:
        languageFilter === 'ALL' ? undefined : Number.parseInt(languageFilter),
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguageFilter(value);
    onFilterChange({
      status:
        statusFilter === 'ALL' ? undefined : (statusFilter as SubmissionStatus),
      languageId: value === 'ALL' ? undefined : Number.parseInt(value),
    });
  };

  const getStatusLabel = () => {
    if (statusFilter === 'ALL') return t('all_status');
    return t(`status_${statusFilter}`);
  };

  const getLanguageLabel = () => {
    if (languageFilter === 'ALL') return t('all_languages');
    const lang = languageList.find((l) => l.id.toString() === languageFilter);
    return lang ? lang.name : t('language');
  };

  return (
    <div className="p-3 border-b border-border bg-muted/20">
      <div className="flex gap-2">
        <div className="w-[180px]">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 px-3 text-xs justify-between bg-background border-border hover:bg-muted/50 font-normal focus:ring-1 focus:ring-primary/20"
              >
                <span className="truncate">{getStatusLabel()}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
              <DropdownMenuItem
                onClick={() => handleStatusChange('ALL')}
                className="text-xs"
              >
                {t('all_status')}
              </DropdownMenuItem>
              {Object.entries(SubmissionStatus).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className="text-xs"
                >
                  {t(`status_${key}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-[180px]">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 px-3 text-xs justify-between bg-background border-border hover:bg-muted/50 font-normal focus:ring-1 focus:ring-primary/20"
              >
                <span className="truncate">{getLanguageLabel()}</span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px] max-h-[300px] overflow-y-auto">
              <div className="p-2 sticky top-0 bg-popover z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder={t('search_language')}
                    className="h-7 text-xs pl-7"
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ALL')}
                className="text-xs"
              >
                {t('all_languages')}
              </DropdownMenuItem>
              {filteredLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id.toString())}
                  className="text-xs"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
              {filteredLanguages.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  {t('no_languages_found')}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
