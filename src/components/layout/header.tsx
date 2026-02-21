'use client';

import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { UserMenu } from './user-menu';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default function Header() {
  const { user, clearUserData } = useApp();
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const navItems = [
    { name: t('problems'), href: '/problems' },
    { name: t('contests'), href: '/contests' },
    { name: t('ranking'), href: '/ranking' },
    { name: t('discuss'), href: '/discuss' },
    { name: t('interview'), href: '/interview' },
  ];

  const handleLogout = async () => {
    clearUserData();
    await signOut({
      callbackUrl: '/login',
      redirect: true,
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <span className="text-xl font-bold tracking-tight text-primary">
            {t('app_name')}
          </span>
        </Link>

        {/* Right Side: Nav + User */}
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

          {/* Search & Notifications */}
          <div className="hidden md:flex items-center gap-3 ml-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search', 'Search...')}
                className="w-[200px] pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all duration-200"
              />
            </div>
            {user && <NotificationBell />}
          </div>

          {/* Separator */}
          <div className="hidden md:block h-5 w-px bg-border" />

          {/* User Menu */}
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}
