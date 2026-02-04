'use client';

import { useApp } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { UserMenu } from './user-menu';

export default function Header() {
  const { user, clearUserData } = useApp();
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const navItems = [
    { name: t('problems'), href: '/problems' },
    { name: t('contests'), href: '/contests' },
    { name: t('ranking'), href: '/ranking' },
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
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="text-xl font-bold tracking-tight text-primary">
            {t('app_name')}
          </span>
        </Link>

        {/* Right Side: Nav + User */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
    </nav>
  );
}
