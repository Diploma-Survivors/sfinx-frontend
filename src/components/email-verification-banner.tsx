'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmailVerificationBanner() {
  const { t } = useTranslation('common');
  const { isLoggedin, isEmailVerified, isLoading } = useApp();

  if (isLoading || !isLoggedin || isEmailVerified) {
    return null;
  }

  return (
    <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t('email_not_verified_warning')}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-yellow-200 hover:bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:hover:bg-yellow-900/40 dark:text-yellow-200"
          onClick={() => {
            // TODO: Implement resend verification email logic or redirect to profile
            // For now, maybe just redirect to profile settings
            window.location.href = '/settings';
          }}
        >
          {t('verify_email')}
        </Button>
      </div>
    </div>
  );
}
