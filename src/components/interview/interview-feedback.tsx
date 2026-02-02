'use client';

import { useTranslation } from 'react-i18next';
import {
  Clock,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InterviewFeedbackProps {
  interviewTime: number;
  onStartNew?: () => void;
}

export function InterviewFeedback({
  interviewTime,
  onStartNew,
}: InterviewFeedbackProps) {
  const { t } = useTranslation('interview');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scores = [
    { key: 'problemSolving', score: 88, color: 'text-purple-500' },
    { key: 'communication', score: 85, color: 'text-blue-500' },
    { key: 'codeQuality', score: 92, color: 'text-green-500' },
  ];

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-3 gap-2">
              {scores.map((item) => (
                <div
                  key={item.key}
                  className="text-center p-3 rounded-lg bg-muted/50 border"
                >
                  <div className={`text-xl font-bold ${item.color}`}>
                    {item.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {t(`feedback.${item.key}`)}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t('feedback.strengths')}
              </h3>
              <ul className="space-y-1.5">
                {[1, 2, 3, 4].map((i) => (
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

            <div className="h-px bg-border" />

            <div className="flex gap-2">
              <Button className="flex-1 text-xs">
                {t('feedback.viewReport')}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
              <Button variant="outline" onClick={onStartNew}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                {t('feedback.newInterview')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
