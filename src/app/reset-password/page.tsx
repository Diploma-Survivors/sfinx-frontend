'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthService } from '@/services/auth-service';
import { toastService } from '@/services/toasts-service';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">{t('invalid_link')}</CardTitle>
            <CardDescription>{t('invalid_reset_link_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">{t('back_to_login')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toastService.error(t('passwords_do_not_match'));
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      toastService.error(t('password_requirements'));
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword({ token, newPassword });
      toastService.success(t('password_reset_successfully'));
      router.push('/login');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      toastService.error(
        error.response?.data?.message || t('failed_to_reset_password')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('reset_password')}
          </CardTitle>
          <CardDescription>{t('enter_new_password')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('new_password')}</Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {t('confirm_new_password')}
              </Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? t('resetting') : t('reset_password')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
