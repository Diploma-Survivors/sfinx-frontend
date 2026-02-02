'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/services/auth-service';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/contexts/app-context';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Track verification promises globally to prevent double-verification
// and ensure all component instances get the result
const verificationPromises = new Map<string, Promise<'success' | 'error'>>();

export default function VerifyEmailPage() {
  const { t } = useTranslation('auth');
  const { refreshUser } = useApp();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Get existing promise or create a new one
    let promise = verificationPromises.get(token);

    if (!promise) {
      console.log('Starting verification for token:', token);
      promise = AuthService.verifyEmail({ token })
        .then(async () => {
          console.log('Verification successful.');
          // Refresh user data to update the banner immediately
          try {
            await refreshUser();
          } catch (e) {
            console.error('Failed to refresh user data:', e);
          }
          return 'success' as const;
        })
        .catch(async (error: any) => {
          console.error('Verification failed:', error);
          // If the error is 409 (Conflict), it means the email is already verified.
          if (error.response?.status === 409) {
            console.log('409 Conflict detected, treating as success.');
            try {
              await refreshUser();
            } catch (e) {
              console.error('Failed to refresh user data:', e);
            }
            return 'success' as const;
          }
          return 'error' as const;
        });

      verificationPromises.set(token, promise);
    } else {
      console.log('Reusing existing verification promise for token:', token);
    }

    // Wait for the result
    let mounted = true;
    promise.then((result) => {
      if (mounted) {
        setStatus(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('email_verification')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 py-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500">{t('verifying_email')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('verification_successful')}
                </h3>
                <p className="text-gray-500">
                  {t('verification_successful_desc')}
                </p>
              </div>
              <Link href="/" className="w-full">
                <Button className="w-full">{t('go_to_home')}</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('verification_failed')}
                </h3>
                <p className="text-gray-500">{t('verification_failed_desc')}</p>
              </div>
              <Link href="/settings" className="w-full">
                <Button variant="outline" className="w-full">
                  {t('back_to_settings')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
