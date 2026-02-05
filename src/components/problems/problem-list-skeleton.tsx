import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

export default function ProblemListSkeleton() {
  const { t } = useTranslation('problems');

  return (
    <div className="w-full border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-12 text-center py-3">
                {/* Status */}
              </TableHead>

              <TableHead className="w-16 font-medium text-muted-foreground text-center py-3">
                #
              </TableHead>
              <TableHead className="font-medium text-muted-foreground py-3">
                <div className="flex items-center">{t('title')}</div>
              </TableHead>

              <TableHead className="w-4 py-1">{/* Premium Status */}</TableHead>

              <TableHead className="w-32 font-medium text-muted-foreground py-3">
                <div className="flex items-center">{t('difficulty')}</div>
              </TableHead>

              <TableHead className="w-28 text-center font-medium text-muted-foreground py-3">
                {t('ac_rate')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i} className="border-b border-border/50">
                <TableHead className="w-12 text-center py-3">
                  <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                </TableHead>
                <TableHead className="w-16 text-center py-3">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableHead>
                <TableHead className="py-3">
                  <Skeleton className="h-4 w-48" />
                </TableHead>
                <TableHead className="w-4 py-1">
                  {/* Premium Status */}
                </TableHead>
                <TableHead className="w-32 py-3">
                  <Skeleton className="h-5 w-16" />
                </TableHead>
                <TableHead className="w-28 text-center py-3">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </TableHead>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
