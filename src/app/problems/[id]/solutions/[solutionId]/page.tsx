'use client';

import SolutionDetailPanel from '@/components/problems/tabs/solutions/solution-detail-panel';
import { SolutionsService } from '@/services/solutions-service';
import type { Solution } from '@/types/solutions';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

export default function SolutionDetailPage() {
  const { t } = useTranslation('problems');
  const params = useParams();
  const router = useRouter();
  const solutionId = params.solutionId as string;
  const problemId = params.id as string;

  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const response = await SolutionsService.getSolutionDetail(solutionId);
        setSolution(response.data.data);
      } catch (error) {
        console.error('Failed to fetch solution', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSolution();
  }, [solutionId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Solution not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/problems/${problemId}/solutions`)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_list')}
        </Button>
        <h2 className="font-semibold text-foreground truncate">
          {solution.title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SolutionDetailPanel
          solution={solution}
          onDelete={() => router.push(`/problems/${problemId}/solutions`)}
        />
      </div>
    </div>
  );
}
