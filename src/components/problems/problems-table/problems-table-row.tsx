"use client";

import { useApp } from "@/contexts/app-context";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProblemDifficulty, ProblemStatus } from "@/types/problems";
import type { Problem } from "@/types/problems";
import { CheckCircle2, Circle, Clock, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PremiumModal } from "@/components/problems/premium-modal";
import SaveToListButton from "@/components/problems/favorite-list/save-to-list-button";
import { useParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import AddToCollectionSubMenu from "@/components/problems/favorite-list/add-to-list-submenu";
import { favoriteListService } from "@/services/favorite-list-service";
import { toastService } from "@/services/toasts-service";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

interface ProblemTableRowProps {
  problem: Problem;
  openInNewTab?: boolean;
}

export default function ProblemTableRow({ problem, openInNewTab }: ProblemTableRowProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { user } = useApp();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const { t } = useTranslation("problems");

  // Check if we are in a collection view
  const isCollectionPage = pathname?.includes("/problems/collection/");
  const collectionId =
    isCollectionPage && params?.id ? parseInt(params.id as string) : null;

  const handleRemoveFromList = async (listId: number) => {
    try {
      await favoriteListService.removeProblem(listId, problem.id);
      toastService.success(t("remove_from_list_success"));
      // Trigger a re-fetch of the collection problems
      await mutate(`/favorite-lists/${listId}/problems`);
    } catch (error) {
      toastService.error(t("remove_from_list_error"));
    }
  };

  const getDifficultyColor = (difficulty: ProblemDifficulty) => {
    switch (difficulty) {
      case ProblemDifficulty.EASY:
        return "text-green-600 bg-green-500/10 border-green-200 dark:text-green-400 dark:border-green-800";
      case ProblemDifficulty.MEDIUM:
        return "text-yellow-600 bg-yellow-500/10 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800";
      case ProblemDifficulty.HARD:
        return "text-red-600 bg-red-500/10 border-red-200 dark:text-red-400 dark:border-red-800";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getDifficultyLabel = (difficulty: ProblemDifficulty) => {
    return difficulty
      ? t(`difficulty_${difficulty.toLowerCase()}`)
      : t("unknown");
  };

  const handleRowClick = () => {
    if (problem.isPremium && (!user || !user.isPremium)) {
      setIsPremiumModalOpen(true);
      return;
    }
    const url = `/problems/${problem.id}/description`;
    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors group border-border/50 h-14"
        onClick={handleRowClick}
      >
        {/* Status */}
        <TableCell className="text-center p-0 w-12">
          <div className="flex justify-center items-center">
            {problem.status === ProblemStatus.SOLVED ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : problem.status === ProblemStatus.ATTEMPTED ? (
              <Circle className="w-4 h-4 text-muted-foreground/30" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
        </TableCell>

        {/* Index */}
        <TableCell className="font-mono text-muted-foreground w-16 text-center text-sm">
          {problem.id}
        </TableCell>

        {/* Title */}
        <TableCell className="font-medium text-foreground text-base w-full">
          <div className="flex items-center flex-wrap gap-2">
            <span className="truncate max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
              {problem.title}
            </span>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {problem.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border/50 whitespace-nowrap"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TableCell>

        {/* Premium Status */}
        <TableCell className="p-0 w-4 text-center">
          {problem.isPremium && (
            <Tooltip content={t("premium_problem")}>
              <div className="flex justify-center items-center">
                <Crown className="w-4.5 h-4.5 text-[oklch(0.55_0.18_60)] fill-[oklch(0.55_0.18_60)]/20" />
              </div>
            </Tooltip>
          )}
        </TableCell>

        {/* Difficulty */}
        <TableCell className="w-32">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-20",
              getDifficultyColor(problem.difficulty),
            )}
          >
            {getDifficultyLabel(problem.difficulty)}
          </span>
        </TableCell>

        {/* Acceptance */}
        <TableCell className="text-center w-28">
          <span className="text-muted-foreground text-sm font-mono">
            {problem.acceptanceRate !== undefined
              ? `${Number(problem.acceptanceRate).toFixed(1)}%`
              : "-"}
          </span>
        </TableCell>

        {/* Save to List or Context Menu */}
        <TableCell
          className="text-center w-16 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center items-center">
            {collectionId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleRemoveFromList(collectionId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{t("remove_from_list")}</span>
                  </DropdownMenuItem>
                  <AddToCollectionSubMenu problemId={problem.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SaveToListButton problemId={problem.id} />
            )}
          </div>
        </TableCell>
      </TableRow>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </>
  );
}
