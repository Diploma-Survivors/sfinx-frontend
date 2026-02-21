'use client';

import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FavoriteList } from '@/types/favorite-list';
import type { Problem } from '@/types/problems';
import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import {
    CheckCircle2,
    Play,
    Share2,
    Trash2,
    PenSquare,
    Lock,
    Globe,
    Plus,
    Copy,
    Bookmark,
} from 'lucide-react';
import { favoriteListService } from '@/services/favorite-list-service';
import { useTranslation } from 'react-i18next';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { useState, useEffect } from 'react';
import { AddProblemsToCollectionModal } from './add-problems-to-collection-modal';
import { EditListModal } from './edit-list-modal';
import { useRouter } from 'next/navigation';
import { toastService } from '@/services/toasts-service';

interface FavoriteListOverviewProps {
    list: FavoriteList;
    problems: Problem[];
    onPractice?: () => void;
    onProblemsUpdated?: () => void;
    onListUpdated?: () => void;
}

export default function FavoriteListOverview({
    list,
    problems,
    onPractice,
    onProblemsUpdated,
    onListUpdated,
}: FavoriteListOverviewProps) {
    const { t } = useTranslation('problems');
    const router = useRouter();
    const { user } = useApp();
    const [isAddProblemsModalOpen, setIsAddProblemsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwner = user?.id === list.userId;

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

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const checkSavedStatus = async () => {
            if (user && !isOwner) {
                try {
                    const savedLists = await favoriteListService.getSavedLists();
                    setIsSaved(savedLists.some(l => l.id === list.id));
                } catch (error) {
                    console.error('Failed to check saved status', error);
                }
            }
        };
        checkSavedStatus();
    }, [user, isOwner, list.id]);

    const handleToggleSave = async () => {
        try {
            setIsSaving(true);
            if (isSaved) {
                await favoriteListService.unsave(list.id);
                setIsSaved(false);
                toastService.success(t('list_unsaved', 'List removed from your saved lists'));
            } else {
                await favoriteListService.save(list.id);
                setIsSaved(true);
                toastService.success(t('list_saved', 'List saved to your collection'));
            }
            onListUpdated?.();
        } catch (error) {
            console.error('Failed to toggle save list', error);
            toastService.error(t('error_saving', 'Failed to update list status'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleIconClick = () => {
        if (isOwner) {
            document.getElementById('list-icon-upload')?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            // Toast error
            return;
        }

        try {
            setIsUploading(true);
            await favoriteListService.uploadIcon(list.id, file);
            onListUpdated?.();
        } catch (error) {
            console.error('Failed to upload icon', error);
        } finally {
            setIsUploading(false);
        }
    };

    const renderIcon = (icon: string) => {
        const content = icon.startsWith('http') ? (
            <img
                src={icon}
                alt="icon"
                className="h-16 w-16 rounded-xl object-cover shadow-sm transition-opacity group-hover:opacity-75"
            />
        ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 text-3xl transition-opacity group-hover:opacity-75">
                {icon}
            </div>
        );

        return (
            <div
                className={cn("relative inline-block", isOwner ? "group cursor-pointer" : "")}
                onClick={handleIconClick}
                title={isOwner ? t('change_icon', 'Change Icon') : undefined}
            >
                {content}
                {isOwner && (
                    <>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PenSquare className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            </div>
                        )}
                        <input
                            type="file"
                            id="list-icon-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* List Info Card */}
            <Card className="border-none shadow-none bg-transparent p-0">
                <div>
                    <div className="space-y-4">
                        {renderIcon(list.icon)}
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
                            {isOwner && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => setIsAddProblemsModalOpen(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    {/* Edit Button */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <PenSquare className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {!isOwner && (
                                <Button
                                    variant={isSaved ? "secondary" : "outline"}
                                    className="gap-2 rounded-full"
                                    onClick={handleToggleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                                    )}
                                    {isSaved ? t('saved', 'Saved') : t('save_list', 'Save list')}
                                </Button>
                            )}
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

            <AddProblemsToCollectionModal
                isOpen={isAddProblemsModalOpen}
                onClose={() => setIsAddProblemsModalOpen(false)}
                listId={list.id}
                currentProblemIds={problems.map((p) => p.id)}
                onSuccess={() => {
                    onProblemsUpdated?.();
                }}
            />

            <EditListModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                list={list}
                onSuccess={() => {
                    onListUpdated?.();
                }}
            />
        </div>
    );
}
