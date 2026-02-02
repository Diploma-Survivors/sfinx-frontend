'use client';

import SubmissionDetail from '@/components/problems/tabs/submissions/submission-detail';
import { SubmissionsService } from '@/services/submissions-service';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubmissionDetailPage() {
  const { t } = useTranslation('problems');
  const params = useParams();
  const router = useRouter();
  const submissionIdString = params.submissionId as string;
  const submissionId = parseInt(submissionIdString);
  const problemIdString = params.id as string;
  const problemId = parseInt(problemIdString);

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response =
          await SubmissionsService.getSubmissionById(submissionId);
        setSubmission(response.data.data);
      } catch (error) {
        console.error('Failed to fetch submission', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Submission not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/problems/${problemId}/submissions`)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_list')}
        </Button>
        <span className="font-semibold text-foreground">
          Submission #{submission.id}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SubmissionDetail submission={submission} />
      </div>
    </div>
  );
}
