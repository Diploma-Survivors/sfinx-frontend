import SortControls from '@/components/problems/problems-filter/sort-controls';
import type { SortBy, SortOrder } from '@/types/problems';
import { FaList } from 'react-icons/fa6';

import { useTranslation } from 'react-i18next';

interface ProblemTableHeaderProps {
  currentCount: number;
  totalCount: number;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortByChange: (newSortBy: SortBy) => void;
  onSortOrderChange: (newSortOrder: SortOrder) => void;
}

export default function ProblemTableHeader({
  currentCount,
  totalCount,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: ProblemTableHeaderProps) {
  const { t } = useTranslation('problems');
  return (
    <div className="px-6 py-4 border-b border-border bg-muted/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <FaList className="text-muted-foreground" />
          <span>{t('problems_list')}</span>
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{currentCount}</span> /{' '}
            {totalCount} {t('problems')}
          </div>
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={onSortByChange}
            onSortOrderChange={onSortOrderChange}
          />
        </div>
      </div>
    </div>
  );
}
