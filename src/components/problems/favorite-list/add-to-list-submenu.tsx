'use client';

import {
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { toastService } from '@/services/toasts-service';
import { cn } from '@/lib/utils';
import { favoriteListService } from '@/services/favorite-list-service';
import useSWR, { mutate } from 'swr';
import { FavoriteList } from '@/types/favorite-list';
import { Check, Plus, Star } from 'lucide-react';
import { useState } from 'react';

interface AddToCollectionSubMenuProps {
    problemId: number;
}

export default function AddToCollectionSubMenu({ problemId }: AddToCollectionSubMenuProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [newListIcon, setNewListIcon] = useState(
        'https://play-lh.googleusercontent.com/2X1xHmYDF33roRwWqJOUgiFvF4Bi8fUbaw3mkODIasg68WIJM_9kmA9akRZUi3k5jaZ278RqpB4vatLOMRSKERc'
    );
    const [newListIsPublic, setNewListIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const { data: lists = [] } = useSWR<FavoriteList[]>(
        '/favorite-lists',
        favoriteListService.getAll
    );

    const handleConfirmCreateList = async () => {
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

    const handleToggleList = async (listId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const list = lists.find((l) => l.id === listId);
        if (!list) return;

        const isInList = list.problems?.some((p) => p.id === problemId);

        try {
            if (isInList) {
                await favoriteListService.removeProblem(listId, problemId);
                toastService.success('Problem removed from list');
            } else {
                await favoriteListService.addProblem(listId, problemId);
                toastService.success('Problem added to list');
            }
            mutate('/favorite-lists');
        } catch (error: any) {
            toastService.error(
                error.response?.data?.message || 'Failed to update list'
            );
        }
    };

    const renderIcon = (icon: string) => {
        if (icon.startsWith('http')) {
            return (
                <img
                    src={icon}
                    alt="icon"
                    className="h-4 w-4 rounded object-cover"
                />
            );
        }
        return <span className="text-sm">{icon}</span>;
    };

    return (
        <>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Add to List</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-56">
                        <div className="max-h-[300px] overflow-y-auto">
                            {lists.map((list) => {
                                const isInList = list.problems?.some((p) => p.id === problemId);
                                return (
                                    <DropdownMenuItem
                                        key={list.id}
                                        onClick={(e) => handleToggleList(list.id, e)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div
                                                className={cn(
                                                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                                                    isInList
                                                        ? 'border-accent bg-accent text-accent-foreground'
                                                        : 'border-muted-foreground/30'
                                                )}
                                            >
                                                {isInList && <Check className="h-3 w-3" />}
                                            </div>
                                            {renderIcon(list.icon)}
                                            <span className="truncate flex-1">{list.name}</span>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create a new list</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New List</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sub-list-name">Title</Label>
                            <div className="relative">
                                <Input
                                    id="sub-list-name"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    placeholder="Enter a list name"
                                    maxLength={30}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {newListName.length}/30
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sub-list-description">Description</Label>
                            <div className="relative">
                                <textarea
                                    id="sub-list-description"
                                    value={newListDescription}
                                    onChange={(e) => setNewListDescription(e.target.value)}
                                    placeholder="Describe your list"
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
                                id="sub-list-private"
                                checked={!newListIsPublic}
                                onChange={(e) => setNewListIsPublic(!e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <Label htmlFor="sub-list-private" className="cursor-pointer font-normal">
                                Private
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCreateList}
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create List'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
