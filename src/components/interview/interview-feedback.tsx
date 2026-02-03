'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { InterviewEvaluation } from '@/types/interview';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InterviewFeedbackProps {
  interviewTime: number;
  evaluation?: InterviewEvaluation | null;
  onStartNew?: () => void;
  onViewHistory?: () => void;
}

export function InterviewFeedback({
  interviewTime,
  evaluation,
  onStartNew,
  onViewHistory,
}: InterviewFeedbackProps) {
  const { t } = useTranslation('interview');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Default/mock scores if no evaluation provided
  const scores = evaluation
    ? [
        {
          key: 'problemSolving',
          score: evaluation.problemSolvingScore,
          icon: Brain,
          color: 'text-purple-500',
        },
        {
          key: 'communication',
          score: evaluation.communicationScore,
          icon: MessageSquare,
          color: 'text-blue-500',
        },
        {
          key: 'codeQuality',
          score: evaluation.codeQualityScore,
          icon: Code2,
          color: 'text-green-500',
        },
        {
          key: 'technical',
          score: evaluation.technicalScore,
          icon: TrendingUp,
          color: 'text-orange-500',
        },
      ]
    : [
        {
          key: 'problemSolving',
          score: 0,
          icon: Brain,
          color: 'text-purple-500',
        },
        {
          key: 'communication',
          score: 0,
          icon: MessageSquare,
          color: 'text-blue-500',
        },
        { key: 'codeQuality', score: 0, icon: Code2, color: 'text-green-500' },
        {
          key: 'technical',
          score: 0,
          icon: TrendingUp,
          color: 'text-orange-500',
        },
      ];

  const overallScore = evaluation?.overallScore || 0;
  const strengths = evaluation?.strengths || [];
  const improvements = evaluation?.improvements || [];

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-muted/30 overflow-auto">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden">
          <div className="p-5 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{t('feedback.title')}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(interviewTime)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {overallScore}
                </div>
                <div className="text-xs text-muted-foreground">Overall</div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {scores.map((item) => (
                <div
                  key={item.key}
                  className="text-center p-3 rounded-lg bg-muted/50 border"
                >
                  <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                  <div className={`text-xl font-bold ${item.color}`}>
                    {item.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {t(`feedback.${item.key}`)}
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Feedback */}
            {evaluation?.detailedFeedback && (
              <div className="p-4 rounded-lg bg-muted/30 border">
                <h3 className="text-sm font-semibold mb-2">
                  Detailed Feedback
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {evaluation.detailedFeedback}
                </p>
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {t('feedback.strengths')}
                </h3>
                <ul className="space-y-1.5">
                  {strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  {t('feedback.improvements')}
                </h3>
                <ul className="space-y-1.5">
                  {improvements.map((improvement, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mock sections for when no evaluation yet */}
            {!evaluation && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {t('feedback.strengths')}
                  </h3>
                  <ul className="space-y-1.5">
                    {[1, 2, 3].map((i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground/80"
                      >
                        <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">
                          {t(`strengths.${i}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    {t('feedback.improvements')}
                  </h3>
                  <ul className="space-y-1.5">
                    {[1, 2, 3].map((i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground/80"
                      >
                        <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">
                          {t(`improvements.${i}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="h-px bg-border" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {onViewHistory && (
                <Button
                  variant="outline"
                  onClick={onViewHistory}
                  className="flex-1"
                >
                  {t('feedback.viewHistory')}
                </Button>
              )}
              {onStartNew && (
                <Button onClick={onStartNew} className="flex-1">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {t('feedback.newInterview')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
