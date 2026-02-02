import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

export default function ContestListSkeleton() {
  const { t } = useTranslation('contests');

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-border/50 hover:bg-transparent">
            <TableHead className="w-12 text-center py-3">
              {/* Status Icon */}
            </TableHead>
            <TableHead className="font-medium text-muted-foreground py-3">
              {t('contest_name')}
            </TableHead>
            <TableHead className="w-48 font-medium text-muted-foreground py-3">
              {t('start_time')}
            </TableHead>
            <TableHead className="w-32 font-medium text-muted-foreground py-3">
              {t('duration')}
            </TableHead>
            <TableHead className="w-32 text-center font-medium text-muted-foreground py-3">
              {t('status')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i} className="border-b border-border/50">
              <TableHead className="w-12 text-center py-3">
                <Skeleton className="h-5 w-5 rounded-full mx-auto" />
              </TableHead>
              <TableHead className="py-3">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </TableHead>
              <TableHead className="w-48 py-3">
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead className="w-32 py-3">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="w-32 text-center py-3">
                <Skeleton className="h-6 w-24 mx-auto rounded-full" />
              </TableHead>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
