'use client';

import { UserMenu } from '@/components/layout/user-menu';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContestNavbarProps {
    onMenuClick: () => void;
    onNextProblem: () => void;
    onPrevProblem: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    endTime?: string;
}

export default function ContestSolveNavbar({
    onMenuClick,
    onNextProblem,
    onPrevProblem,
    hasPrev,
    hasNext,
    endTime,
}: ContestNavbarProps) {
    const { t } = useTranslation('contests');
    const { t: tCommon } = useTranslation('common');
    const { user, clearUserData } = useApp();
    const pathname = usePathname();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    const navItems = [
        { name: tCommon('problems'), href: '/problems' },
        { name: tCommon('contests'), href: '/contests' },
        { name: tCommon('ranking'), href: '/ranking' },
    ];

    useEffect(() => {
        if (!endTime) return;

        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                return null;
            }

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (!left) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const handleLogout = async () => {
        clearUserData();
        await signOut({
            callbackUrl: '/login',
            redirect: true,
        });
    };

    return (
        <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-40">
            {/* Left: App Icon & Navigation */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <span className="text-xl font-bold tracking-tight text-primary">
                        {tCommon('app_name')}
                    </span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    title={t('open_sidebar')}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                <div className="h-4 w-px bg-border mx-2" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPrevProblem}
                        disabled={!hasPrev}
                        title={t('previous')}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNextProblem}
                        disabled={!hasNext}
                        title={t('next')}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Center: Timer (Centered) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
                    timeLeft
                        ? "bg-muted/30 border-border/50"
                        : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                )}>
                    <Clock className={cn("w-4 h-4", timeLeft ? "text-muted-foreground" : "text-red-500")} />
                    <span className="font-mono text-sm font-medium">
                        {timeLeft || t('contest_ended', { defaultValue: 'Contest Ended' })}
                    </span>
                </div>
            </div>

            {/* Right: Nav Items + User Menu */}
            <div className="flex items-center gap-4 sm:gap-6">
                {/* Navigation - Desktop */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "text-primary bg-primary/10 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Separator */}
                <div className="hidden md:block h-5 w-px bg-border" />

                {/* User Menu */}
                <UserMenu user={user} onLogout={handleLogout} />
            </div>
        </div>
    );
}
