import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StudyPlanDifficulty, type StudyPlanDetailResponseDto, type StudyPlanProgressResponseDto, EnrollmentStatus } from '@/types/study-plans';
import { BookOpen, CalendarDays, CheckCircle2, Lock, Target, Trophy, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useRouter, usePathname } from 'next/navigation';

interface StudyPlanHeaderProps {
  plan: StudyPlanDetailResponseDto;
  progress: StudyPlanProgressResponseDto | null;
  onEnroll: () => Promise<void>;
  isEnrolling: boolean;
}

export default function StudyPlanHeader({ plan, progress, onEnroll, isEnrolling }: StudyPlanHeaderProps) {
  const { t } = useTranslation('study-plans');
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const isCompleted = plan.enrollmentStatus === EnrollmentStatus.COMPLETED;
  const isEnrolled = plan.isEnrolled;
  const progressPercentage = progress?.progressPercentage || 0;

  const handleEnrollClick = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=${pathname}`);
      return;
    }

    try {
      setEnrollError(null);
      await onEnroll();
    } catch (err: any) {
      setEnrollError(err?.message || "Failed to enroll. Please try again.");
    }
  };

  const getDifficultyColor = (difficulty: StudyPlanDifficulty) => {
    switch (difficulty) {
      case StudyPlanDifficulty.BEGINNER:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case StudyPlanDifficulty.INTERMEDIATE:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case StudyPlanDifficulty.ADVANCED:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/40 backdrop-blur-sm p-6 md:p-10 mb-8">
      {/* Cover Image Background */}
      {plan.coverImageUrl ? (
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <img 
            src={plan.coverImageUrl} 
            alt={plan.name}
            className="w-full h-full object-cover opacity-20 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-muted/90 via-muted/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-muted/90 via-muted/10 to-transparent" />
        </div>
      ) : (
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      )}
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            {plan.isPremium && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono text-xs uppercase">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Premium
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-sm capitalize", getDifficultyColor(plan.difficulty))}>
              {t(`difficulty.${plan.difficulty}`, plan.difficulty)}
            </Badge>
            <Badge variant="outline" className="text-sm bg-secondary/80 text-secondary-foreground border-border">
              <CalendarDays className="w-4 h-4 mr-1.5" />
              {plan.estimatedDays} {t('days', 'days')}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {plan.name}
            </h1>
            {plan.description && (
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                {plan.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              {plan.totalProblems} {t('problems')}
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              {plan.enrollmentCount} {t('enrolled', 'enrolled')}
            </span>
          </div>

          {(plan.tags.length > 0 || plan.topics.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {plan.topics.map(topic => (
                <Badge key={`topic-${topic.id}`} variant="secondary">
                  {topic.name}
                </Badge>
              ))}
              {plan.tags.map(tag => (
                <Badge key={`tag-${tag.id}`} variant="outline" className="text-muted-foreground">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-80 shrink-0 flex flex-col justify-center">
          <div className="p-6 rounded-xl border border-border bg-card shadow-2xl">
            {isEnrolled ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20 text-primary">
                    {isCompleted ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">
                      {isCompleted ? t('completed', 'Completed!') : t('in_progress', 'In Progress')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.solvedCount} / {plan.totalProblems} {t('problems_solved', 'problems solved')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('progress', 'Progress')}</span>
                    <span className="text-primary font-bold">{progressPercentage}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-bold text-foreground text-center mb-2">
                  {t('ready_to_start', 'Ready to start?')}
                </h4>
                <Button 
                  onClick={handleEnrollClick} 
                  disabled={isEnrolling}
                  className="w-full h-12 transition-all hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)]"
                >
                  {isEnrolling ? t('enrolling', 'Enrolling...') : t('enroll_now', 'Enroll Now')}
                </Button>
                {enrollError && (
                  <p className="text-destructive text-sm text-center mt-2">{enrollError}</p>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  {t('enroll_desc', 'Join thousands of developers mastering these concepts.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
