'use client';

import { AvatarUploadModal } from '@/components/profile/avatar-upload-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { AccountSettings } from '@/components/settings/account';
import { BasicInfoSettings } from '@/components/settings/basic-info';
import { BillingSettings } from '@/components/settings/billing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/contexts/app-context';
import { toastService } from '@/services/toasts-service';
import { UserService } from '@/services/user-service';
import axios from 'axios';
import {
    Camera,
    CreditCard,
    ExternalLink,
    Lock,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
    const { t } = useTranslation('profile');
    const { user, refreshUser, isLoading } = useApp();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    // Deep linking for tabs
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = (searchParams.get('tab') as 'basic-info' | 'account' | 'billing') || 'basic-info';

    const handleTabChange = (tab: string) => {
        router.push(`/settings?tab=${tab}`);
    };

    const handleAvatarClick = () => {
        setIsAvatarModalOpen(true);
    };

    const handleAvatarSave = async (blob: Blob) => {
        try {
            // 1. Get presigned URL
            const { data: uploadData } = await UserService.getAvatarUploadUrl({
                fileName: 'avatar.jpg',
                contentType: 'image/jpeg',
            });

            // 2. Upload to S3 (using axios)
            await axios.put(uploadData.data.uploadUrl, blob, {
                headers: {
                    'Content-Type': 'image/jpeg',
                },
            });

            // 3. Confirm upload
            await UserService.confirmAvatarUpload({
                key: uploadData.data.key,
            });
            toastService.success(t('avatarUploadedSuccessfully'));
            // 4. Refresh global user state (navbar)
            if (refreshUser) {
                await refreshUser();
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toastService.error(t('avatarUploadFailed'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <header className="bg-[#282828] text-white py-8">
                    <div className="container mx-auto px-4 max-w-6xl flex items-center gap-6">
                        <Skeleton className="w-24 h-24 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 bg-gray-700" />
                            <Skeleton className="h-4 w-32 bg-gray-700" />
                        </div>
                    </div>
                </header>
                <div className="container mx-auto px-4 max-w-6xl py-8">
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 md:col-span-3 space-y-1">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="col-span-12 md:col-span-9">
                            <Skeleton className="h-[500px] w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">User not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* 1. Header Section */}
            <header className="bg-[#282828] text-white py-8">
                <div className="container mx-auto px-4 max-w-6xl flex items-center gap-6">
                    <div className="relative group">
                        <Avatar
                            userId={user.id}
                            className="w-24 h-24 border border-slate-200 dark:border-slate-700"
                        >
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>
                                <img
                                    src="/avatars/placeholder.png"
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={handleAvatarClick}
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{user.username}</h1>
                        <p className="text-gray-400 mt-1">Username: {user.username}</p>
                    </div>

                    <AvatarUploadModal
                        isOpen={isAvatarModalOpen}
                        onClose={() => setIsAvatarModalOpen(false)}
                        onSave={handleAvatarSave}
                        currentAvatarUrl={user.avatarUrl}
                    />
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-6xl py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* 2. Sidebar Navigation */}
                    <div className="col-span-12 md:col-span-3 space-y-1">
                        <NavItem
                            active={currentTab === 'basic-info'}
                            icon={<User className="w-4 h-4" />}
                            label={t('basic_info')}
                            onClick={() => handleTabChange('basic-info')}
                        />
                        <NavItem
                            active={currentTab === 'account'}
                            icon={<Lock className="w-4 h-4" />}
                            label={t('account')}
                            onClick={() => handleTabChange('account')}
                        />
                        <NavItem
                            active={currentTab === 'billing'}
                            icon={<CreditCard className="w-4 h-4" />}
                            label={t('billing')}
                            onClick={() => handleTabChange('billing')}
                        />
                    </div>

                    {/* 3. Main Content Area */}
                    <div className="col-span-12 md:col-span-9 space-y-6">
                        {currentTab === 'basic-info' && refreshUser && <BasicInfoSettings user={user} refreshUser={refreshUser} />}
                        {currentTab === 'account' && <AccountSettings user={user} />}
                        {currentTab === 'billing' && <BillingSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function NavItem({ active, icon, label, external, onClick }: { active?: boolean; icon: React.ReactNode; label: string; external?: boolean; onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-md cursor-pointer transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-medium text-sm">{label}</span>
            </div>
            {external && <ExternalLink className="w-3 h-3 opacity-50" />}
        </div>
    );
}
