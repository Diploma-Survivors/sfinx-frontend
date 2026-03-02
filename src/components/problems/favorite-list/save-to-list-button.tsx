"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toastService } from "@/services/toasts-service";
import { cn } from "@/lib/utils";
import { favoriteListService } from "@/services/favorite-list-service";
import useSWR, { mutate } from "swr";
import { FavoriteList } from "@/types/favorite-list";
import { Check, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/app-context";

interface SaveToListButtonProps {
  problemId: number;
}

export default function SaveToListButton({ problemId }: SaveToListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListIcon, setNewListIcon] = useState(
    "https://play-lh.googleusercontent.com/2X1xHmYDF33roRwWqJOUgiFvF4Bi8fUbaw3mkODIasg68WIJM_9kmA9akRZUi3k5jaZ278RqpB4vatLOMRSKERc",
  );
  const [newListIsPublic, setNewListIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useApp();

  const { data: lists = [] } = useSWR<FavoriteList[]>(
    user ? "/favorite-lists" : null,
    favoriteListService.getAll,
  );
  const { t } = useTranslation("problems");

  const handleConfirmCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      setIsCreating(true);
      await favoriteListService.create({
        name: newListName,
        isPublic: newListIsPublic,
        icon: newListIcon,
      });
      mutate("/favorite-lists");
      setNewListName("");
      setNewListDescription("");
      setNewListIsPublic(false);
      setIsCreateDialogOpen(false);
      toastService.success(t("list_created_success"));
    } catch (error) {
      toastService.error(t("list_created_error"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const isInList = list.problems?.some((p) => p.id === problemId);

    try {
      if (isInList) {
        await favoriteListService.removeProblem(listId, problemId);
        toastService.success(t("remove_from_list_success"));
      } else {
        await favoriteListService.addProblem(listId, problemId);
        toastService.success(t("problem_added_success"));
      }
      mutate("/favorite-lists");
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("list_update_error"),
      );
    }
  };

  const handleCreateList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreateDialogOpen(true);
    setIsOpen(false);
  };

  const isInAnyList = lists.some((list) =>
    list.problems?.some((p) => p.id === problemId),
  );

  const renderIcon = (icon: string) => {
    if (icon.startsWith("http")) {
      return (
        <img src={icon} alt="icon" className="h-6 w-6 rounded object-cover" />
      );
    }
    return <span className="text-base">{icon}</span>;
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent/10",
              isInAnyList && "text-yellow-500 hover:text-yellow-600",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <Star className={cn("h-4 w-4", isInAnyList && "fill-current")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <h3 className="font-semibold text-base mb-3">{t("my_lists")}</h3>
            <div className="space-y-1">
              {lists.map((list) => {
                const isInList = list.problems?.some((p) => p.id === problemId);
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={(e) => handleToggleList(list.id, e)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                      isInList && "bg-accent/10",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                          isInList
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-muted-foreground/30",
                        )}
                      >
                        {isInList && <Check className="h-3 w-3" />}
                      </div>
                      {renderIcon(list.icon)}
                      <span className="font-medium">{list.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleCreateList}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>{t("create_new_list")}</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t("create_new_list")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">{t("title")}</Label>
              <div className="relative">
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder={t("enter_list_name")}
                  maxLength={30}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {newListName.length}/30
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description">{t("description")}</Label>
              <div className="relative">
                <textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder={t("describe_list")}
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
              <Label
                htmlFor="list-private"
                className="cursor-pointer font-normal"
              >
                {t("private")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleConfirmCreateList} disabled={isCreating}>
              {isCreating ? t("creating") : t("create_list")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
