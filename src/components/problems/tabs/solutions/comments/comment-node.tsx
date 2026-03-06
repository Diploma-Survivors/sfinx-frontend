"use client";

import { Button } from "@/components/ui/button";
import type { SolutionComment } from "@/types/solutions";
import { ChevronDown, ChevronUp, Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import CommentItem from "./comment-item";

interface CommentNodeProps {
  comment: SolutionComment;
  getReplies: (parentId: number) => SolutionComment[];
  solutionId: string;
  onReplySuccess: (newComment: SolutionComment) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  expandedReplies: Set<number>;
  toggleReplies: (commentId: number) => void;
  depth?: number;
}

export default function CommentNode({
  comment,
  getReplies,
  solutionId,
  onReplySuccess,
  onUpdate,
  onDelete,
  expandedReplies,
  toggleReplies,
  depth = 0,
}: CommentNodeProps) {
  const { t } = useTranslation("problems");
  const replies = getReplies(comment.id);
  const hasReplies = comment.replyCount > 0 || replies.length > 0;
  const isExpanded = expandedReplies.has(comment.id);

  // Different styling for top-level vs nested
  const containerClass =
    depth === 0
      ? "bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-4"
      : "bg-slate-100 dark:bg-slate-800 p-3 rounded-lg space-y-3";

  return (
    <div className={containerClass}>
      {comment.isPinned && depth === 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-500">
          <Pin className="w-3.5 h-3.5 fill-current" />
          {t("pinned_comment")}
        </div>
      )}
      <CommentItem
        comment={comment}
        solutionId={solutionId}
        onReplySuccess={onReplySuccess}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {hasReplies && (
        <div className={depth === 0 ? "pl-4 sm:pl-8" : "pl-2 sm:pl-4"}>
          {!isExpanded ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-slate-500 h-auto p-0 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-300"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              {t("view_replies", {
                count: replies.length || comment.replyCount,
              })}
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReplies(comment.id)}
                className="text-slate-500 h-auto p-0 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-300"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                {t("hide_replies")}
              </Button>

              <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                {replies.map((reply) => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    getReplies={getReplies}
                    solutionId={solutionId}
                    onReplySuccess={onReplySuccess}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    expandedReplies={expandedReplies}
                    toggleReplies={toggleReplies}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
