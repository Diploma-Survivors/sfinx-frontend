"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { InterviewService } from "@/services/interview-service";
import { toastService } from "@/services/toasts-service";
import type { Interview, InterviewStatus } from "@/types/interview";
import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Loader2,
  MessageSquare,
  Play,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

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
  return format(new Date(dateString), "dd/MM/yyyy HH:mm");
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

function getDifficultyBadge(difficulty?: string) {
  if (!difficulty) return null;
  const lower = difficulty.toLowerCase();
  const classes =
    lower === "easy"
      ? "bg-green-500/10 text-green-600"
      : lower === "medium"
        ? "bg-yellow-500/10 text-yellow-600"
        : "bg-red-500/10 text-red-600";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${classes}`}
    >
      {difficulty}
    </span>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-muted mt-1 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min((score / 10) * 100, 100)}%` }}
      />
    </div>
  );
}

const SCORE_CATEGORIES = [
  { key: "problemSolvingScore", icon: Brain, color: "text-purple-500", bar: "bg-purple-500", labelKey: "history.score_problem_solving" },
  { key: "communicationScore", icon: MessageSquare, color: "text-blue-500", bar: "bg-blue-500", labelKey: "history.score_communication" },
  { key: "codeQualityScore", icon: Code2, color: "text-green-500", bar: "bg-green-500", labelKey: "history.score_code_quality" },
  { key: "technicalScore", icon: TrendingUp, color: "text-orange-500", bar: "bg-orange-500", labelKey: "history.score_technical" },
] as const;

function getCardAccent(status: InterviewStatus) {
  switch (status) {
    case "completed": return "border-l-[3px] border-l-primary";
    case "active": return "border-l-[3px] border-l-blue-500";
    default: return "border-l-[3px] border-l-muted-foreground/30";
  }
}

export default function InterviewHistoryPage() {
  const { t } = useTranslation("interview");
  const router = useRouter();
  const { isLoggedin, isEmailVerified } = useApp();
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

  const requireAuth = (): boolean => {
    if (!isLoggedin) {
      toastService.error(t("login_required_action"));
      return false;
    }
    if (!isEmailVerified) {
      toastService.error(t("email_verification_required_action"));
      return false;
    }
    return true;
  };

  const handleOpenInterview = (interviewId: string) => {
    if (!requireAuth()) return;
    router.push(`/interview/${interviewId}`);
  };

  const handleStartNewInterview = () => {
    if (!requireAuth()) return;
    router.push("/interview");
  };

  const completedInterviews = interviews.filter(
    (iv) => iv.status === "completed" && iv.evaluation,
  );
  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce(
            (sum, iv) => sum + (iv.evaluation?.overallScore ?? 0),
            0,
          ) / completedInterviews.length,
        )
      : null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30">
      <div className="max-w-5xl mx-auto p-6">
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

        {/* Stats Summary */}
        {!isLoading && !error && interviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <Card className="p-4 border-primary/20 bg-primary/5 overflow-hidden relative">
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-primary/10 pointer-events-none" />
              <div className="p-1.5 rounded-md bg-primary/10 w-fit mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{interviews.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t("history.total_sessions")}
              </div>
            </Card>
            <Card className="p-4 border-green-500/20 bg-green-500/5 overflow-hidden relative">
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-green-500/10 pointer-events-none" />
              <div className="p-1.5 rounded-md bg-green-500/10 w-fit mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {completedInterviews.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t("history.completed")}
              </div>
            </Card>
            {averageScore !== null && (
              <Card className="p-4 col-span-2 sm:col-span-1 border-orange-500/20 bg-orange-500/5 overflow-hidden relative">
                <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-orange-500/10 pointer-events-none" />
                <div className="p-1.5 rounded-md bg-orange-500/10 w-fit mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {averageScore}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    /10
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("history.avg_score")}
                </div>
              </Card>
            )}
          </div>
        )}

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
            <Button onClick={handleStartNewInterview}>
              <Play className="w-4 h-4 mr-1" />
              {t("history.start_interview")}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card
                key={interview.id}
                className={`p-5 hover:shadow-md transition-shadow ${getCardAccent(interview.status)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">
                        {interview.problemSnapshot?.title ||
                          t("history.unknown_problem")}
                      </h3>
                      {getDifficultyBadge(
                        interview.problemSnapshot?.difficulty,
                      )}
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
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {interview.evaluation.overallScore}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {interview.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenInterview(interview.id)}
                      >
                        {t("history.resume")}
                      </Button>
                    )}
                    {interview.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInterview(interview.id)}
                      >
                        {t("history.view_details")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Score breakdown */}
                {interview.evaluation && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2">
                    {SCORE_CATEGORIES.map(({ key, icon: Icon, color, bar, labelKey }) => (
                      <div key={key} className="text-center p-2 rounded-lg bg-muted/40">
                        <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${color}`} />
                        <div className={`text-base font-bold ${color}`}>
                          {interview.evaluation[key]}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                          {t(labelKey)}
                        </div>
                        <ScoreBar score={interview.evaluation[key]} color={bar} />
                      </div>
                    ))}
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
