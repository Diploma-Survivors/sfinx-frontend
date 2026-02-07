'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FavoriteList } from '@/types/favorite-list';
import type { Problem } from '@/types/problems';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import {
    CheckCircle2,
    MoreHorizontal,
    Play,
    Share2,
    Trash2,
    PenSquare,
    Lock,
    Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface FavoriteListOverviewProps {
    list: FavoriteList;
    problems: Problem[];
    onPractice?: () => void;
}

export default function FavoriteListOverview({
    list,
    problems,
    onPractice,
}: FavoriteListOverviewProps) {
    const { t } = useTranslation('problems');

    const totalProblems = problems.length;
    const solvedProblems = problems.filter(
        (p) => p.status === ProblemStatus.SOLVED
    ).length;
    const attemptedProblems = problems.filter(
        (p) => p.status === ProblemStatus.ATTEMPTED
    ).length;

    const progressPercentage =
        totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    const difficultyStats = {
        [ProblemDifficulty.EASY]: {
            total: problems.filter((p) => p.difficulty === ProblemDifficulty.EASY)
                .length,
            solved: problems.filter(
                (p) =>
                    p.difficulty === ProblemDifficulty.EASY &&
                    p.status === ProblemStatus.SOLVED
            ).length,
            color: 'text-green-500',
            bgColor: 'bg-green-500/20',
        },
        [ProblemDifficulty.MEDIUM]: {
            total: problems.filter((p) => p.difficulty === ProblemDifficulty.MEDIUM)
                .length,
            solved: problems.filter(
                (p) =>
                    p.difficulty === ProblemDifficulty.MEDIUM &&
                    p.status === ProblemStatus.SOLVED
            ).length,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/20',
        },
        [ProblemDifficulty.HARD]: {
            total: problems.filter((p) => p.difficulty === ProblemDifficulty.HARD)
                .length,
            solved: problems.filter(
                (p) =>
                    p.difficulty === ProblemDifficulty.HARD &&
                    p.status === ProblemStatus.SOLVED
            ).length,
            color: 'text-red-500',
            bgColor: 'bg-red-500/20',
        },
    };

    const renderIcon = (icon: string) => {
        if (icon.startsWith('http')) {
            return (
                <img
                    src={icon}
                    alt="icon"
                    className="h-16 w-16 rounded-xl object-cover shadow-sm"
                />
            );
        }
        return (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 text-3xl">
                {icon}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* List Info Card */}
            <Card className="border-none shadow-none bg-transparent p-0">
                <div className="flex items-start gap-6">
                    {renderIcon(list.icon)}
                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {list.name}
                                </h1>
                                {!list.isPublic && <Lock className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {list.user?.username || 'User'}
                                </span>
                                <span>•</span>
                                <span>
                                    {totalProblems} {t('questions', 'questions')}
                                </span>
                                <span>•</span>
                                <span>
                                    {list.isPublic ? t('public', 'Public') : t('private', 'Private')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button onClick={onPractice} className="gap-2 rounded-full px-6">
                                <Play className="h-4 w-4 fill-current" />
                                {t('practice', 'Practice')}
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {list.description && (
                            <p className="text-muted-foreground text-sm max-w-2xl">
                                {list.description}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Statistics Card */}
            <Card className="overflow-hidden border bg-card">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-center gap-8">
                            <div className="h-32 w-32 shrink-0">
                                <CircularProgressbar
                                    value={progressPercentage}
                                    text={`${solvedProblems}/${totalProblems}`}
                                    styles={buildStyles({
                                        textSize: '20px',
                                        pathColor: 'oklch(0.55 0.18 160)', // Primary/Accent Green
                                        textColor: 'currentColor',
                                        trailColor: 'var(--muted)',
                                        backgroundColor: 'transparent',
                                    })}
                                />
                                <div className="mt-2 text-center text-xs font-medium text-muted-foreground">
                                    {t('solved', 'Solved')}
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                {(Object.keys(difficultyStats) as ProblemDifficulty[]).map(
                                    (difficulty) => {
                                        const stats = difficultyStats[difficulty];
                                        const percentage =
                                            stats.total > 0
                                                ? Math.round((stats.solved / stats.total) * 100)
                                                : 0;

                                        return (
                                            <div key={difficulty} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="capitalize text-muted-foreground">
                                                        {difficulty.toLowerCase()}
                                                    </span>
                                                    <span className="font-medium">
                                                        {stats.solved}
                                                        <span className="text-muted-foreground">
                                                            /{stats.total}
                                                        </span>
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={percentage}
                                                    className="h-1.5"
                                                    indicatorClassName={stats.color.replace('text-', 'bg-')}
                                                />
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
