'use client';

import { Button } from '@/components/ui/button';
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import clientApi from '@/lib/apis/axios-client';
import { toastService } from '@/services/toasts-service';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/problems';

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const finalUsername = (formData.get('username') as string) || username;
    const finalPassword = (formData.get('password') as string) || password;

    if (isSignUp) {
      if (password !== confirmPassword) {
        toastService.error(t('passwords_do_not_match'));
        return;
      }

      try {
        await clientApi.post('/auth/register', {
          email,
          username,
          password,
          fullName,
        });
        toastService.success(t('registration_successful'));

        // Auto login after successful registration
        const result = await signIn('credentials', {
          username: finalUsername,
          password: finalPassword,
          redirect: true,
          callbackUrl,
        });

        if (result?.error) {
          toastService.error(result.error);
        }
      } catch (error: any) {
        toastService.error(
          error.response?.data?.message || t('registration_failed')
        );
      }
    } else {
      const result = await signIn('credentials', {
        username: finalUsername,
        password: finalPassword,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        toastService.error(result.error);
      } else {
        window.location.href = callbackUrl;
      }
    }
  };

  const handleGoogleLogin = async () => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/google';
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            {t('welcome_back')}
          </CardTitle>
          <CardDescription>
            {isSignUp ? t('create_account_desc') : t('enter_login_info')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    placeholder={t('email')}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder={t('full_name')}
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Input
                id="username"
                name="username"
                placeholder={t('username')}
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <PasswordInput
                id="password"
                name="password"
                placeholder={t('password')}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  {t('forgot_password')}?
                </button>
              </div>
            )}
            {isSignUp && (
              <div className="space-y-2">
                <PasswordInput
                  id="confirm-password"
                  name="confirmPassword"
                  placeholder={t('confirm_password')}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button className="w-full" type="submit">
              {isSignUp ? t('sign_up') : t('sign_in')}
            </Button>
          </form>

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('or_login_with')}
              </span>
            </div>
          </div>

          <Button
            onClick={() => handleGoogleLogin()}
            variant="outline"
            className="w-full mt-4"
            type="button"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            {isSignUp ? t('already_have_account') : t('dont_have_account')}{' '}
            <span
              onClick={toggleMode}
              className="underline underline-offset-4 hover:text-primary cursor-pointer font-medium"
            >
              {isSignUp ? t('sign_in') : t('sign_up')}
            </span>
          </div>
        </CardFooter>
      </Card>
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}
