'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserProfile } from '@/types/user';
import { Crown, History, LogIn, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  user?: UserProfile;
  onLogout: () => void;
}
const PLACEHOLDER_AVATAR =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useTranslation('common');

  if (user) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer hover:opacity-80 transition-opacity border border-border">
            <AvatarImage
              src={user.avatarUrl || PLACEHOLDER_AVATAR}
              alt={user.fullName}
            />
            <AvatarFallback className="bg-muted p-0 overflow-hidden">
              <img
                src={PLACEHOLDER_AVATAR}
                alt="Fallback Profile"
                className="h-full w-full object-cover"
              />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium leading-none text-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/pricing"
              className={cn(
                "cursor-pointer w-full flex items-center py-2.5 transition-colors",
                user.isPremium
                  ? "bg-gradient-to-r from-[oklch(0.55_0.18_60)]/10 to-transparent"
                  : ""
              )}
            >
              <Crown
                className={cn(
                  "mr-3 h-4 w-4 transition-colors",
                  user.isPremium
                    ? "text-[oklch(0.55_0.18_60)] fill-[oklch(0.55_0.18_60)]/20"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span className={cn(
                "font-medium",
                user.isPremium
                  ? "bg-clip-text text-transparent bg-gradient-to-r from-[oklch(0.55_0.18_60)] to-[oklch(0.55_0.2_280)]"
                  : ""
              )}>
                {user.isPremium ? 'Premium Plan' : 'Free Plan'}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/profile/${user.id}`}
              className="cursor-pointer w-full flex items-center py-2.5"
            >
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>{t('my_profile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/profile/${user.id}/practice`}
              className="cursor-pointer w-full flex items-center py-2.5"
            >
              <History className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>{t('practice_history')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="cursor-pointer w-full flex items-center py-2.5"
            >
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>{t('settings')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer w-full flex items-center py-2.5"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href="/login">
      <Button
        className="flex items-center gap-2 rounded-lg"
        variant="default"
        size="sm"
      >
        <LogIn size={16} />
        {t('go_to_login')}
      </Button>
    </Link>
  );
}
