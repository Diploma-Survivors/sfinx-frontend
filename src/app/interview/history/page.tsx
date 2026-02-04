'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InterviewService } from '@/services/interview-service';
import type { Interview, InterviewStatus } from '@/types/interview';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  TrendingUp,
} from 'lucide-react';

function formatDuration(startedAt: string, endedAt?: string) {
  if (!endedAt) return 'In progress';
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const seconds = Math.floor((end - start) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: InterviewStatus) {
  switch (status) {
    case 'completed':
      return (
        <Badge
          variant="default"
          className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'active':
      return (
        <Badge
          variant="default"
          className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
          In Progress
        </Badge>
      );
    case 'abandoned':
      return <Badge variant="secondary">Abandoned</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function InterviewHistoryPage() {
  const { t } = useTranslation('interview');
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await InterviewService.getInterviewHistory();
      setInterviews(response.data.data || []);
    } catch (err) {
      setError('Failed to load interview history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = (interviewId: string) => {
    // TODO: Implement resume interview flow
    router.push(`/interview?resume=${interviewId}`);
  };

  const handleViewDetails = (interviewId: string) => {
    router.push(`/interview/${interviewId}`);
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-muted/30">
      <div className="h-full max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/interview')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Interview History</h1>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadInterviews}>Try Again</Button>
          </Card>
        ) : interviews.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold mb-2">No interviews yet</h2>
            <p className="text-muted-foreground mb-4">
              Start your first mock interview to practice your coding skills
            </p>
            <Button onClick={() => router.push('/interview')}>
              <Play className="w-4 h-4 mr-1" />
              Start Interview
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 overflow-auto max-h-[calc(100%-80px)]">
            {interviews.map((interview) => (
              <Card
                key={interview.id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {interview.problemSnapshot?.title || 'Unknown Problem'}
                      </h3>
                      {getStatusBadge(interview.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(interview.startedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(interview.startedAt, interview.endedAt)}
                      </span>
                      {interview.evaluation && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Score: {interview.evaluation.overallScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {interview.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleResume(interview.id)}
                      >
                        Resume
                      </Button>
                    )}
                    {interview.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(interview.id)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>

                {/* Evaluation Summary */}
                {interview.evaluation && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-500">
                        {interview.evaluation.problemSolvingScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Problem Solving
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">
                        {interview.evaluation.communicationScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Communication
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">
                        {interview.evaluation.codeQualityScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Code Quality
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-500">
                        {interview.evaluation.technicalScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Technical
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
