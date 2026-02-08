'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { favoriteListService } from '@/services/favorite-list-service';
import { toastService } from '@/services/toasts-service';
import type { FavoriteList } from '@/types/favorite-list';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface EditListModalProps {
    isOpen: boolean;
    onClose: () => void;
    list: FavoriteList;
    onSuccess?: () => void;
}

export function EditListModal({
    isOpen,
    onClose,
    list,
    onSuccess,
}: EditListModalProps) {
    const { t } = useTranslation('problems');
    const [name, setName] = useState(list.name);
    const [description, setDescription] = useState(list.description || '');
    const [isPublic, setIsPublic] = useState(list.isPublic);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(list.name);
            setDescription(list.description || '');
            setIsPublic(list.isPublic);
        }
    }, [isOpen, list]);

    const handleUpdate = async () => {
        if (!name.trim()) return;

        try {
            setIsSubmitting(true);
            await favoriteListService.update(list.id, {
                name,
                description,
                isPublic,
            });
            toastService.success(t('list_updated', 'List updated successfully'));
            onSuccess?.();
            onClose();
        } catch (error) {
            toastService.error(t('update_failed', 'Failed to update list'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{t('edit_list', 'Edit List')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-list-name">{t('title', 'Title')}</Label>
                        <div className="relative">
                            <Input
                                id="edit-list-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('enter_list_name', 'Enter a list name')}
                                maxLength={30}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {name.length}/30
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-list-description">
                            {t('description', 'Description')}
                        </Label>
                        <div className="relative">
                            <textarea
                                id="edit-list-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('describe_list', 'Describe your list')}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                maxLength={150}
                            />
                            <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                                {description.length}/150
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-list-private"
                            checked={!isPublic}
                            onChange={(e) => setIsPublic(!e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <Label
                            htmlFor="edit-list-private"
                            className="cursor-pointer font-normal"
                        >
                            {t('private', 'Private')}
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        {t('cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleUpdate} disabled={isSubmitting}>
                        {isSubmitting
                            ? t('saving', 'Saving...')
                            : t('save_changes', 'Save Changes')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
