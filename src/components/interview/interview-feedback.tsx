"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import type { InterviewEvaluation } from "@/types/interview";
import {
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface InterviewFeedbackProps {
  interviewTime: number;
  evaluation?: InterviewEvaluation | null;
  onStartNew?: () => void;
  onViewHistory?: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score / 10, 0), 1);
  const dashOffset = circumference * (1 - progress);

  const color =
    score >= 8
      ? "text-green-500"
      : score >= 6
        ? "text-primary"
        : score >= 4
          ? "text-yellow-500"
          : "text-destructive";

  const strokeColor =
    score >= 8
      ? "#22c55e"
      : score >= 6
        ? "oklch(0.54 0.17 142)"
        : score >= 4
          ? "#eab308"
          : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-muted/50"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground leading-none">/10</span>
      </div>
    </div>
  );
}

function ScoreBar({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-muted mt-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function InterviewFeedback({
  interviewTime,
  evaluation,
  onStartNew,
  onViewHistory,
}: InterviewFeedbackProps) {
  const { t } = useTranslation("interview");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const scoreCategories = [
    {
      key: "problemSolving",
      score: evaluation?.problemSolvingScore ?? 0,
      icon: Brain,
      iconColor: "text-purple-500",
      barColor: "bg-purple-500",
      cardBg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      key: "communication",
      score: evaluation?.communicationScore ?? 0,
      icon: MessageSquare,
      iconColor: "text-blue-500",
      barColor: "bg-blue-500",
      cardBg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      key: "codeQuality",
      score: evaluation?.codeQualityScore ?? 0,
      icon: Code2,
      iconColor: "text-green-500",
      barColor: "bg-green-500",
      cardBg: "bg-green-500/10 border-green-500/20",
    },
    {
      key: "technical",
      score: evaluation?.technicalScore ?? 0,
      icon: TrendingUp,
      iconColor: "text-orange-500",
      barColor: "bg-orange-500",
      cardBg: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  const overallScore = evaluation?.overallScore ?? 0;
  const strengths = evaluation?.strengths ?? [];
  const improvements = evaluation?.improvements ?? [];

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-muted/30 overflow-auto">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h1 className="text-xl font-bold">{t("feedback.title")}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(interviewTime)}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ScoreRing score={overallScore} />
                <span className="text-xs text-muted-foreground font-medium">
                  {t("feedback.overall")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {scoreCategories.map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-lg border ${item.cardBg}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <span className="text-[10px] text-muted-foreground leading-tight truncate">
                      {t(`feedback.${item.key}`)}
                    </span>
                  </div>
                  <div className={`text-xl font-bold ${item.iconColor}`}>
                    {item.score}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      /10
                    </span>
                  </div>
                  <ScoreBar score={item.score} color={item.barColor} />
                </div>
              ))}
            </div>

            {/* Detailed Feedback */}
            {evaluation?.detailedFeedback && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/15">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  {t("feedback.detailed_feedback")}
                </h3>
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <MarkdownRenderer content={evaluation.detailedFeedback} />
                </div>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/15">
                <h3 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {t("feedback.strengths")}
                </h3>
                <ul className="space-y-1.5">
                  {strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <h3 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {t("feedback.improvements")}
                </h3>
                <ul className="space-y-1.5">
                  {improvements.map((improvement, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {onViewHistory && (
                <Button
                  variant="outline"
                  onClick={onViewHistory}
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                >
                  {t("feedback.viewHistory")}
                </Button>
              )}
              {onStartNew && (
                <Button onClick={onStartNew} className="flex-1">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {t("feedback.newInterview")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
