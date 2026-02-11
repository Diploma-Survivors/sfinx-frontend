'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastService } from '@/services/toasts-service';
import { cn } from '@/lib/utils';
import { favoriteListService } from '@/services/favorite-list-service';
import type { FavoriteList } from '@/types/favorite-list';
import useSWR, { mutate } from 'swr';
import { ChevronDown, FileText, Globe, Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MyListsFilterProps {
    selectedListId?: string;
    onListSelect: (listId?: string) => void;
}

export default function MyListsFilter({
    selectedListId,
    onListSelect,
}: MyListsFilterProps) {
    const { t } = useTranslation('problems');
    const router = useRouter();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [newListIcon, setNewListIcon] = useState(
        'https://play-lh.googleusercontent.com/2X1xHmYDF33roRwWqJOUgiFvF4Bi8fUbaw3mkODIasg68WIJM_9kmA9akRZUi3k5jaZ278RqpB4vatLOMRSKERc'
    );
    const [newListIsPublic, setNewListIsPublic] = useState(false); // Default private
    const [isCreating, setIsCreating] = useState(false);

    const { data: lists = [] } = useSWR<FavoriteList[]>(
        '/favorite-lists',
        favoriteListService.getAll
    );

    const { data: savedLists = [] } = useSWR<FavoriteList[]>(
        '/favorite-lists/saved/me',
        favoriteListService.getSavedLists
    );

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        try {
            setIsCreating(true);
            await favoriteListService.create({
                name: newListName,
                isPublic: newListIsPublic,
                icon: newListIcon,
            });
            mutate('/favorite-lists');
            setNewListName('');
            setNewListDescription('');
            setNewListIsPublic(false);
            setIsCreateDialogOpen(false);
            toastService.success('List created successfully');
        } catch (error) {
            toastService.error('Failed to create list');
        } finally {
            setIsCreating(false);
        }
    };

    const renderIcon = (icon: string) => {
        if (icon.startsWith('http')) {
            return (
                <img
                    src={icon}
                    alt="icon"
                    className="h-6 w-6 rounded object-cover"
                />
            );
        }
        return <span className="text-base">{icon}</span>;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                    {t('my_lists', 'My Lists')}
                </label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                            <Plus className="h-4 w-4" />
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('new_list', 'New List')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-1">
                {lists.map((list) => (
                    <button
                        key={list.id}
                        type="button"
                        onClick={() => router.push(`/problems/collection/${list.id}`)}
                        className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                            selectedListId === list.id.toString()
                                ? 'bg-muted text-primary font-medium'
                                : 'text-foreground hover:bg-muted'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {renderIcon(list.icon)}
                            <span className="truncate max-w-[140px] text-left">
                                {list.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {list.isPublic ? (
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Saved by me section */}
            {savedLists.length > 0 && (
                <>
                    <div className="my-4 h-[1px] bg-border/40" />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between h-7">
                            <label className="text-sm font-semibold text-foreground">
                                {t('saved_by_me', 'Saved by me')}
                            </label>
                        </div>
                        <div className="space-y-1">
                            {savedLists.map((list) => (
                                <button
                                    key={list.id}
                                    type="button"
                                    onClick={() => router.push(`/problems/collection/${list.id}`)}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                        selectedListId === list.id.toString()
                                            ? 'bg-muted text-primary font-medium'
                                            : 'text-foreground hover:bg-muted'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {renderIcon(list.icon)}
                                        <span className="truncate max-w-[140px] text-left">
                                            {list.name}
                                        </span>
                                    </div>

                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('create_new_list', 'Create New List')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="list-name">{t('title', 'Title')}</Label>
                            <div className="relative">
                                <Input
                                    id="list-name"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder={t('enter_list_name', 'Enter a list name')}
                                    maxLength={30}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {newListName.length}/30
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="list-description">
                                {t('description', 'Description')}
                            </Label>
                            <div className="relative">
                                <textarea
                                    id="list-description"
                                    value={newListDescription}
                                    onChange={(e) => setNewListDescription(e.target.value)}
                                    placeholder={t('describe_list', 'Describe your list')}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    maxLength={150}
                                />
                                <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                                    {newListDescription.length}/150
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="list-private"
                                checked={!newListIsPublic}
                                onChange={(e) => setNewListIsPublic(!e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <Label htmlFor="list-private" className="cursor-pointer font-normal">
                                {t('private', 'Private')}
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                        >
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateList}
                            disabled={isCreating}
                        >
                            {isCreating
                                ? t('creating', 'Creating...')
                                : t('create_list', 'Create List')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
