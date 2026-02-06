'use client';

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
import { UserService } from '@/services/user-service';
import type { UserProfile } from '@/types/user';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BasicInfoSettingsProps {
    user: UserProfile;
    refreshUser: () => Promise<void>;
}

export function BasicInfoSettings({ user, refreshUser }: BasicInfoSettingsProps) {
    const { t } = useTranslation('profile');
    const [isAddingWebsite, setIsAddingWebsite] = useState(false);

    const handleSave = async (field: keyof UserProfile, value: any) => {
        try {
            const updateData: any = {};
            updateData[field] = value;

            await UserService.updateMe(updateData);
            await refreshUser();
            setIsAddingWebsite(false);
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    return (
        <Card className="bg-white shadow-sm rounded-lg overflow-hidden border-none">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{t('basic_info')}</h2>
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
    );
}

// Helper Components (Locally scoped for now, or could be extracted further)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-0 divide-y divide-gray-100">
            {title && <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>}
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
            <div className="col-span-3 text-sm font-medium text-gray-500">{label}</div>
            <div className="col-span-7">
                {isEditing ? (
                    <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="max-w-md h-8 text-sm"
                    />
                ) : (
                    <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {value || placeholder}
                    </span>
                )}
            </div>
            <div className="col-span-2 flex justify-end items-center gap-4">
                {!isPlaceholder && (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="text-sm font-medium text-primary hover:underline">
                                {t('done')}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-400 hover:underline">
                                {t('cancel')}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="text-sm cursor-pointer font-medium text-primary hover:underline">
                            {t('edit')}
                        </button>
                    )
                )}
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

    useEffect(() => {
        setTempValue(value || '');
    }, [value]);

    return (
        <div className="grid grid-cols-12 py-4 items-start group">
            <div className="col-span-3 text-sm font-medium text-gray-500 pt-2">{t('website_url')}</div>
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
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-8 text-xs font-medium"
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
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                            >
                                <Globe className="w-4 h-4 text-gray-400" />
                                {value}
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400">{t('not_provided')}</span>
                        )}
                        <div className="flex justify-end items-center gap-4">
                            <button onClick={() => setIsAdding(true)} className="text-sm cursor-pointer font-medium text-primary hover:underline">
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
            <div className="col-span-3 text-sm font-medium text-gray-500">{t('preferred_language')}</div>
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
                        <button onClick={handleSave} className="text-sm font-medium text-primary hover:underline">
                            {t('done')}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-400 hover:underline">
                            {t('cancel')}
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-primary hover:underline">
                        {t('edit')}
                    </button>
                )}
            </div>
        </div>
    );
}
