'use client';

import MarkdownRenderer from '@/components/ui/markdown-renderer';
import Timeline from '@/components/contest/timeline';
import { ContestDescriptionSkeleton } from '@/components/contest/contest-description-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContestsService } from '@/services/contests-service';
import {
  Contest,
  ContestStatus,
  ContestUserStatus,
  INITIAL_CONTEST,
} from '@/types/contests';
import { getDifficultyColor } from '@/types/problems';
import {
  CheckCircle,
  Clock,
  FileText,
  Play,
  Trophy,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toastService } from '@/services/toasts-service';

export default function ContestInfoPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation('contests');
  const id = params.id as string;

  const [contest, setContest] = useState<Contest>(INITIAL_CONTEST);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await ContestsService.getContestDetail(id);
        if (response.data && response.data.data) {
          setContest(response.data.data);
        } else {
          setError('Failed to load contest data');
        }
      } catch (err) {
        console.error('Error fetching contest detail:', err);
        setError('An error occurred while fetching contest details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestDetail();
  }, [id]);

  const handleStart = async () => {
    try {
      const response = await ContestsService.participateContest(id);
      router.push(`/contests/${contest.id}/solve`);
    } catch (err) {
      // toastService.error('Error participating in contest');
      console.error('Error participating in contest:', err);
    }
  };

  const handleViewResult = () => {
    router.push(`/contests/${contest.id}/solve`);
  };

  if (isLoading) {
    return <ContestDescriptionSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Button Logic
  const renderActionButton = () => {
    // 1. Scheduled: Hide button
    if (contest.status === ContestStatus.SCHEDULED) {
      return null;
    }

    // 2. Ended + Not Joined: Hide button
    if (
      contest.status === ContestStatus.ENDED &&
      contest.userStatus === ContestUserStatus.NOT_JOINED
    ) {
      return null;
    }

    // 3. Ended + Joined: Show View Result
    if (
      contest.status === ContestStatus.ENDED &&
      contest.userStatus === ContestUserStatus.JOINED
    ) {
      return (
        <Button
          size="lg"
          onClick={handleViewResult} // Assuming same route for now
          variant="outline"
          className="px-8 font-semibold shadow-sm transition-all"
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('view_result', { defaultValue: 'View Result' })}
        </Button>
      );
    }

    if (ContestsService.isInProgress(contest)) {
      return (
        <Button
          size="lg"
          onClick={handleStart}
          className="px-8 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          <Play className="w-4 h-4 mr-2" />
          {t('continue_contest')}
        </Button>
      );
    }

    // 4. Running (implied): Show Join Contest
    return (
      <Button
        size="lg"
        onClick={handleStart}
        className="px-8 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
      >
        <Play className="w-4 h-4 mr-2" />
        {t('join_contest')}
      </Button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 gap-8">
        {/* Hero Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden relative">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="p-8 relative z-10 text-center space-y-6">
            <div className="inline-flex">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 gap-2 px-3 py-1"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t(contest.status)}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {contest.title}
            </h1>

            <div className="flex justify-center w-full max-w-2xl mx-auto items-center text-muted-foreground gap-8 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>
                  {t('duration')}: {contest.durationMinutes}{' '}
                  {t('minutes', { defaultValue: 'mins' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>
                  {t('prize_pool')}: {t('none', { defaultValue: 'None' })}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="max-w-3xl mx-auto pt-4">
              <Timeline
                timelineEvents={[
                  {
                    id: 'start',
                    name: t('start_time'),
                    timestamp: contest.startTime,
                  },
                  {
                    id: 'end',
                    name: t('end_time'),
                    timestamp: contest.endTime,
                  },
                ]}
              />
            </div>

            <div className="pt-6">{renderActionButton()}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rules */}
          <div
            className={cn(
              'bg-card rounded-xl border border-border p-6 shadow-sm md:col-span-3'
            )}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('contest_rules')}
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>{t('contest_rules_desc')}</p>
              {contest.description && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="font-medium text-foreground mb-2">
                    {t('description')}
                  </h4>
                  <MarkdownRenderer content={contest.description} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Problem List Preview */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="text-lg font-semibold">{t('problems')}</h3>
          </div>
          <div className="divide-y divide-border">
            {contest.contestProblems?.map((cp, idx) => (
              <div
                key={cp.problem.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {cp.problem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`${getDifficultyColor(cp.problem.difficulty)} text-[10px] h-5`}
                      >
                        {cp.problem.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {cp.points ?? 0} {t('points')}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Problem status check - need to see if it's available in contestProblems or we need to fetch it */}
                {/* cp.problem.status might be available if Problem type has it. */}
                {/* Assuming it might not be fully populated in this view, omitting check for now or checking if property exists */}
                {/* {cp.problem.status === 'SOLVED' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )} */}
              </div>
            ))}
            {(!contest.contestProblems ||
              contest.contestProblems.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                {t('no_problems_available')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
