'use client';

import { ChangePasswordModal } from '@/components/profile/change-password-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthService } from '@/services/auth-service';
import { toastService } from '@/services/toasts-service';
import type { UserProfile } from '@/types/user';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AccountSettingsProps {
    user: UserProfile;
}

export function AccountSettings({ user }: AccountSettingsProps) {
    const { t } = useTranslation('profile');
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    return (
        <>
            <Card className="bg-white shadow-sm rounded-lg overflow-hidden border-none">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('account')}</h2>
                </div>
                <div className="p-6 space-y-6">
                    {/* Email Verification Alert */}
                    {user.emailVerified === false && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
                            <div className="mt-0.5">
                                <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-yellow-800">{t('email_not_verified')}</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>{t('email_not_verified_warning')}</p>
                                </div>
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-50"
                                        onClick={async () => {
                                            try {
                                                await AuthService.resendVerificationEmail(user.email);
                                                toastService.success(t('verification_email_sent'));
                                            } catch (error) {
                                                console.error('Failed to resend verification email:', error);
                                                toastService.error(t('failed_to_send_verification_email'));
                                            }
                                        }}
                                    >
                                        {t('resend_verification_email')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-12 py-4 items-center border-b border-gray-100 last:border-0">
                        <div className="col-span-3 text-sm font-medium text-gray-500">{t('username')}</div>
                        <div className="col-span-9 text-sm text-gray-900">{user.username}</div>
                    </div>
                    <div className="grid grid-cols-12 py-4 items-center border-b border-gray-100 last:border-0">
                        <div className="col-span-3 text-sm font-medium text-gray-500">{t('email')}</div>
                        <div className="col-span-9 text-sm text-gray-900">{user.email}</div>
                    </div>
                    <div className="grid grid-cols-12 py-4 items-center">
                        <div className="col-span-3 text-sm font-medium text-gray-500">{t('password')}</div>
                        <div className="col-span-9">
                            <Button variant="outline" size="sm" onClick={() => setIsChangePasswordModalOpen(true)}>
                                {t('change_password')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            />
        </>
    );
}
