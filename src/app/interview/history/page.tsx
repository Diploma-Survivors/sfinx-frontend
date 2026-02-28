"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InterviewService } from "@/services/interview-service";
import type { Interview, InterviewStatus } from "@/types/interview";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  TrendingUp,
} from "lucide-react";

function formatDuration(startedAt: string, endedAt?: string, t?: any) {
  if (!endedAt) return t ? t("history.in_progress") : "In progress";
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const seconds = Math.floor((end - start) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (t) {
    return t("history.duration_format", { mins, secs });
  }
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: InterviewStatus, t: any) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="default"
          className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t("history.status_completed")}
        </Badge>
      );
    case "active":
      return (
        <Badge
          variant="default"
          className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
          {t("history.status_in_progress")}
        </Badge>
      );
    case "abandoned":
      return <Badge variant="secondary">{t("history.status_abandoned")}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function InterviewHistoryPage() {
  const { t } = useTranslation("interview");
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
      setError(t("history.failed_to_load_history"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = (interviewId: string) => {
    router.push(`/interview/${interviewId}`);
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
            onClick={() => router.push("/interview")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("history.back")}
          </Button>
          <h1 className="text-2xl font-bold">
            {t("history.interview_history_title")}
          </h1>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadInterviews}>{t("history.try_again")}</Button>
          </Card>
        ) : interviews.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold mb-2">
              {t("history.no_interviews_yet")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("history.start_first_mock_interview")}
            </p>
            <Button onClick={() => router.push("/interview")}>
              <Play className="w-4 h-4 mr-1" />
              {t("history.start_interview")}
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
                        {interview.problemSnapshot?.title ||
                          t("history.unknown_problem")}
                      </h3>
                      {getStatusBadge(interview.status, t)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(interview.startedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(
                          interview.startedAt,
                          interview.endedAt,
                          t,
                        )}
                      </span>
                      {interview.evaluation && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {t("history.score")}:{" "}
                          {interview.evaluation.overallScore}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {interview.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => handleResume(interview.id)}
                      >
                        {t("history.resume")}
                      </Button>
                    )}
                    {interview.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(interview.id)}
                      >
                        {t("history.view_details")}
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
                        {t("history.score_problem_solving")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">
                        {interview.evaluation.communicationScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("history.score_communication")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">
                        {interview.evaluation.codeQualityScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("history.score_code_quality")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-500">
                        {interview.evaluation.technicalScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("history.score_technical")}
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
