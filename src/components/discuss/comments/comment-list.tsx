"use client";

import type { Comment } from "@/types/discuss";
import { CommentItem } from "./comment-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface CommentListProps {
  comments: Comment[];
  postId: string;
  isLoading: boolean;
  onReplySuccess: () => void;
  onDeleteSuccess: () => void;
}

export function CommentList({
  comments,
  postId,
  isLoading,
  onReplySuccess,
  onDeleteSuccess,
}: CommentListProps) {
  const { t } = useTranslation("discuss");

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50 animate-in fade-in zoom-in-95">
        <p>{t("no_comments_yet")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-0">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onReplySuccess={onReplySuccess}
          onDeleteSuccess={onDeleteSuccess}
          isLast={index === comments.length - 1}
        />
      ))}
    </div>
  );
}
