'use client';

import { AvatarUploadModal } from '@/components/profile/avatar-upload-modal';
import { ChangePasswordModal } from '@/components/profile/change-password-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/contexts/app-context';
import { AuthService } from '@/services/auth-service';
import { toastService } from '@/services/toasts-service';
import { UserService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';
import axios from 'axios';
import {
  Briefcase,
  Camera,
  ChevronRight,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MapPin,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation('profile');
  const { user, refreshUser, isLoading } = useApp();

  // Edit States
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<'basic-info' | 'account'>(
    'basic-info'
  );

  const handleSave = async (field: keyof UserProfile, value: any) => {
    try {
      const updateData: any = {};
      updateData[field] = value;

      await UserService.updateMe(updateData);

      if (refreshUser) {
        await refreshUser();
      }

      setEditingField(null);
      setIsAddingWebsite(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAvatarSave = async (blob: Blob) => {
    try {
      // 1. Get presigned URL
      const { data: uploadData } = await UserService.getAvatarUploadUrl({
        fileName: 'avatar.jpg', // You might want to generate a unique name or use original extension if possible
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        User not found
      </div>
    );
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
              active={activeTab === 'basic-info'}
              icon={<User className="w-4 h-4" />}
              label={t('basic_info')}
              onClick={() => setActiveTab('basic-info')}
            />
            <NavItem
              active={activeTab === 'account'}
              icon={<Lock className="w-4 h-4" />}
              label={t('account')}
              onClick={() => setActiveTab('account')}
            />
            <NavItem
              icon={<CreditCard className="w-4 h-4" />}
              label={t('billing')}
              external
            />
          </div>

          {/* 3. Main Content Area */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {/* Account Section (New) */}
            {activeTab === 'account' && (
              <Card className="bg-white shadow-sm rounded-lg overflow-hidden border-none">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('account')}
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Email Verification Alert */}
                  {user.emailVerified === false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
                      <div className="mt-0.5">
                        <svg
                          className="h-5 w-5 text-yellow-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">
                          {t('email_not_verified')}
                        </h3>
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
                                await AuthService.resendVerificationEmail(
                                  user.email
                                );
                                toastService.success(
                                  t('verification_email_sent')
                                );
                              } catch (error) {
                                console.error(
                                  'Failed to resend verification email:',
                                  error
                                );
                                toastService.error(
                                  t('failed_to_send_verification_email')
                                );
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
                    <div className="col-span-3 text-sm font-medium text-gray-500">
                      {t('username')}
                    </div>
                    <div className="col-span-9 text-sm text-gray-900">
                      {user.username}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 py-4 items-center border-b border-gray-100 last:border-0">
                    <div className="col-span-3 text-sm font-medium text-gray-500">
                      {t('email')}
                    </div>
                    <div className="col-span-9 text-sm text-gray-900">
                      {user.email}
                    </div>
                  </div>
                  <div className="grid grid-cols-12 py-4 items-center">
                    <div className="col-span-3 text-sm font-medium text-gray-500">
                      {t('password')}
                    </div>
                    <div className="col-span-9">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangePasswordModalOpen(true)}
                      >
                        {t('change_password')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Basic Info Section (Renamed from Account) */}
            {activeTab === 'basic-info' && (
              <Card className="bg-white shadow-sm rounded-lg overflow-hidden border-none">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('basic_info')}
                  </h2>
                </div>

                <div className="p-6 space-y-8">
                  <Section title="">
                    <DataRow
                      label={t('full_name')}
                      value={user.fullName}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('fullName', val)}
                      t={t}
                    />
                    <DataRow
                      label={t('bio')}
                      value={user.bio}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('bio', val)}
                      t={t}
                    />
                    <DataRow
                      label={t('address')}
                      value={user.address}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('address', val)}
                      t={t}
                    />
                    <DataRow
                      label={t('phone')}
                      value={user.phone}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('phone', val)}
                      t={t}
                    />
                    <DataRow
                      label={t('github_username')}
                      value={user.githubUsername}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('githubUsername', val)}
                      t={t}
                    />
                    <DataRow
                      label={t('linkedin_url')}
                      value={user.linkedinUrl}
                      placeholder={t('not_provided')}
                      onSave={(val) => handleSave('linkedinUrl', val)}
                      t={t}
                    />
                    <WebsiteRow
                      value={user.websiteUrl}
                      isAdding={isAddingWebsite}
                      setIsAdding={setIsAddingWebsite}
                      onSave={(val) => handleSave('websiteUrl', val)}
                      t={t}
                    />
                    <LanguageRow
                      value={user.preferredLanguage || 'en'}
                      onSave={(val) => handleSave('preferredLanguage', val)}
                      t={t}
                    />
                  </Section>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}

// Helper Components

function NavItem({
  active,
  icon,
  label,
  external,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-md cursor-pointer transition-colors ${
        active ? 'bg-[#4aa9f8] text-white' : 'text-gray-600 hover:bg-gray-100'
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

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

function DataRow({
  label,
  value,
  placeholder,
  isPlaceholder,
  onSave,
  t,
}: {
  label: string;
  value?: string;
  placeholder: string;
  isPlaceholder?: boolean;
  onSave?: (val: string) => void;
  t: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  const handleSave = () => {
    if (onSave) onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-12 py-4 items-center group">
      <div className="col-span-3 text-sm font-medium text-gray-500">
        {label}
      </div>
      <div className="col-span-7">
        {isEditing ? (
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="max-w-md h-8 text-sm"
          />
        ) : (
          <span
            className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {value || placeholder}
          </span>
        )}
      </div>
      <div className="col-span-2 flex justify-end items-center gap-4">
        {!isPlaceholder &&
          (isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-sm font-medium text-[#4aa9f8] hover:underline"
              >
                {t('done')}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm font-medium text-gray-400 hover:underline"
              >
                {t('cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm cursor-pointer font-medium text-[#4aa9f8] hover:underline"
            >
              {t('edit')}
            </button>
          ))}
      </div>
    </div>
  );
}

function WebsiteRow({
  value,
  isAdding,
  setIsAdding,
  onSave,
  t,
}: {
  value?: string;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
  onSave: (val: string) => void;
  t: any;
}) {
  const [tempValue, setTempValue] = useState(value || '');

  // Update tempValue when value changes (e.g. after save)
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  return (
    <div className="grid grid-cols-12 py-4 items-start group">
      <div className="col-span-3 text-sm font-medium text-gray-500 pt-2">
        {t('website_url')}
      </div>
      <div className="col-span-9">
        {isAdding ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 text-gray-400">
                <Globe className="w-4 h-4" />
              </div>
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="max-w-md h-9 text-sm"
                placeholder="https://your-website.com"
              />
            </div>

            <div className="flex gap-3">
              <Button
                size="sm"
                className="bg-[#4aa9f8] hover:bg-[#3d91d6] text-white rounded-full px-6 h-8 text-xs font-medium"
                onClick={() => onSave(tempValue)}
              >
                {t('done')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 hover:bg-transparent h-8 text-xs font-medium"
                onClick={() => {
                  setIsAdding(false);
                  setTempValue(value || '');
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4aa9f8] hover:underline flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                {value}
              </a>
            ) : (
              <span className="text-sm text-gray-400">{t('not_provided')}</span>
            )}
            <div className="flex justify-end items-center gap-4">
              <button
                onClick={() => setIsAdding(true)}
                className="text-sm cursor-pointer font-medium text-[#4aa9f8] hover:underline"
              >
                {t('edit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LanguageRow({
  value,
  onSave,
  t,
}: {
  value: string;
  onSave: (val: string) => void;
  t: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-12 py-4 items-center group">
      <div className="col-span-3 text-sm font-medium text-gray-500">
        {t('preferred_language')}
      </div>
      <div className="col-span-7">
        {isEditing ? (
          <Select value={tempValue} onValueChange={setTempValue}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder={t('preferred_language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="vi">{t('vietnamese')}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-gray-900">
            {value === 'en' ? t('english') : t('vietnamese')}
          </span>
        )}
      </div>
      <div className="col-span-2 flex justify-end items-center gap-4">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-sm font-medium text-[#4aa9f8] hover:underline"
            >
              {t('done')}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-gray-400 hover:underline"
            >
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-[#4aa9f8] hover:underline"
          >
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
}
