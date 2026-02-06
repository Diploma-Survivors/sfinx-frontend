'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { UserProfile } from '@/types/user';
import {
    Calendar,
    Edit,
    Github,
    Globe,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Trophy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileSidebarProps {
    user: UserProfile;
    isCurrentUser: boolean;
    onEditClick: () => void;
}

export function ProfileSidebar({
    user,
    isCurrentUser,
    onEditClick,
}: ProfileSidebarProps) {
    const { t } = useTranslation('profile');

    return (
        <Card className="border border-border bg-card shadow-lg">
            <CardContent className="flex flex-col items-center space-y-4 pt-6 text-center">
                <div className="relative">
                    <Avatar className="h-32 w-32 rounded-xl border-4 border-background shadow-md">
                        <AvatarImage src={user.avatarUrl} className="object-cover" />
                        <AvatarFallback className="rounded-xl">
                            <img
                                src="/avatars/placeholder.png"
                                alt={user.username}
                                className="h-full w-full object-cover"
                            />
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {user.fullName}
                    </h2>
                    <p className="font-medium text-muted-foreground">{user.username}</p>
                </div>
                <Badge
                    variant="secondary"
                    className="bg-yellow-100 px-3 py-1 text-yellow-800 hover:bg-yellow-200"
                >
                    <Trophy className="mr-1 h-3 w-3" />
                    {`${t('rank')} ${user.rank}`}
                </Badge>

                {isCurrentUser && (
                    <Button
                        className="w-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={onEditClick}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit_profile')}
                    </Button>
                )}

                <div className="w-full space-y-3 pt-4 text-left">
                    {user.bio && (
                        <div className="mb-4 border-l-2 border-primary/20 py-1 pl-3 text-sm italic text-muted-foreground">
                            {user.bio}
                        </div>
                    )}

                    {user.address && (
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">{user.address}</span>
                        </div>
                    )}
                    {user.email && (
                        <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">{user.email}</span>
                        </div>
                    )}
                    {user.phone && (
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">{user.phone}</span>
                        </div>
                    )}

                    {user.githubUsername && (
                        <a
                            href={`https://github.com/${user.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Github className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">@{user.githubUsername}</span>
                        </a>
                    )}

                    {user.linkedinUrl && (
                        <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Linkedin className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">LinkedIn</span>
                        </a>
                    )}

                    {user.websiteUrl && (
                        <a
                            href={user.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Globe className="mr-3 h-4 w-4 text-muted-foreground/70" />
                            <span className="truncate text-sm">Website</span>
                        </a>
                    )}

                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-3 h-4 w-4 text-muted-foreground/70" />
                        <span className="truncate text-sm">{`${t('joined')} Dec 2024`}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
