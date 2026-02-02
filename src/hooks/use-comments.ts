import { commentService } from '@/services/comment-service';
import {
  CreateProblemCommentRequest,
  ProblemCommentSortBy,
  ReportProblemCommentRequest,
  UpdateProblemCommentRequest,
  VoteProblemCommentRequest,
} from '@/types/comments';
import { useState } from 'react';
import useSWR from 'swr';
import { useApp } from '@/contexts/app-context';
import { toastService } from '@/services/toasts-service';
import { useTranslation } from 'react-i18next';

export function useComments(problemId: string | number) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortByState] = useState<ProblemCommentSortBy>(
    ProblemCommentSortBy.TOP
  );

  const setSortBy = (newSortBy: ProblemCommentSortBy) => {
    setSortByState(newSortBy);
    setPage(1); // Reset page when sort changes
  };

  const { data, error, isLoading, mutate } = useSWR(
    problemId ? [`/problems/${problemId}/comments`, page, limit, sortBy] : null,
    () =>
      commentService.getComments(problemId, {
        page,
        limit,
        sortBy,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Helper to recursively find and update a comment in the tree
  const updateCommentInTree = (
    comments: any[],
    targetId: number,
    updateFn: (comment: any) => any
  ): any[] => {
    return comments.map((comment) => {
      if (comment.id === targetId) {
        return updateFn(comment);
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, targetId, updateFn),
        };
      }
      return comment;
    });
  };

  // Helper to recursively find a parent and add a reply
  const addReplyInTree = (
    comments: any[],
    parentId: number,
    newReply: any
  ): any[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
          replyCount: comment.replyCount + 1,
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: addReplyInTree(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  // Helper to recursively find a parent and remove a reply
  const removeReplyInTree = (comments: any[], replyId: number): any[] => {
    return comments.map((comment) => {
      // Check if this comment has the reply in its children
      if (comment.replies?.some((r: any) => r.id === replyId)) {
        return {
          ...comment,
          replies: comment.replies.filter((r: any) => r.id !== replyId),
          replyCount: Math.max(0, comment.replyCount - 1),
        };
      }
      // Recursively check deeper
      if (comment.replies) {
        return {
          ...comment,
          replies: removeReplyInTree(comment.replies, replyId),
        };
      }
      return comment;
    });
  };

  const { isLoggedin, isEmailVerified } = useApp();
  const { t: tCommon } = useTranslation('common');

  const checkPermission = () => {
    if (!isLoggedin) {
      toastService.error(tCommon('login_required_action'));
      return false;
    }
    if (!isEmailVerified) {
      toastService.error(tCommon('email_verification_required_action'));
      return false;
    }
    return true;
  };

  const createComment = async (data: CreateProblemCommentRequest) => {
    if (!checkPermission()) return;
    try {
      const newComment = await commentService.createComment(problemId, data);

      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        // If it's a reply
        if (data.parentId) {
          return {
            ...currentData,
            data: addReplyInTree(currentData.data, data.parentId, newComment),
          };
        }

        // If it's a top-level comment
        return {
          ...currentData,
          data: [newComment, ...currentData.data],
          meta: {
            ...currentData.meta,
            total: currentData.meta.total + 1,
          },
        };
      }, false);

      return newComment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  };

  const updateComment = async (
    id: number,
    data: UpdateProblemCommentRequest
  ) => {
    if (!checkPermission()) return;
    try {
      const updatedComment = await commentService.updateComment(id, data);

      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: updateCommentInTree(currentData.data, id, (comment) => ({
            ...comment,
            ...updatedComment,
          })),
        };
      }, false);

      return updatedComment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const deleteComment = async (id: number, parentId?: number | null) => {
    if (!checkPermission()) return;
    try {
      await commentService.deleteComment(id);

      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        // If it's a top-level comment (no parentId provided or explicitly null)
        // Note: The UI passes parentId if it exists.
        if (!parentId) {
          // Check if it's actually in the top level list
          const isTopLevel = currentData.data.some((c: any) => c.id === id);
          if (isTopLevel) {
            return {
              ...currentData,
              data: currentData.data.filter((c: any) => c.id !== id),
              meta: {
                ...currentData.meta,
                total: currentData.meta.total - 1,
              },
            };
          }
        }

        // If we have a parentId, or if it wasn't found at top level, try to remove from tree
        return {
          ...currentData,
          data: removeReplyInTree(currentData.data, id),
        };
      }, false);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  const voteComment = async (id: number, data: VoteProblemCommentRequest) => {
    if (!checkPermission()) return;
    try {
      // Optimistic update
      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: updateCommentInTree(currentData.data, id, (comment) => {
            const currentVote = comment.userVote;
            const newVote = data.voteType;
            let upvoteCount = comment.upvoteCount;
            let downvoteCount = comment.downvoteCount;

            if (currentVote === newVote) return comment;

            if (currentVote === 1) upvoteCount--;
            if (currentVote === -1) downvoteCount--;

            if (newVote === 1) upvoteCount++;
            if (newVote === -1) downvoteCount++;

            return {
              ...comment,
              userVote: newVote,
              upvoteCount,
              downvoteCount,
              voteScore: upvoteCount - downvoteCount,
            };
          }),
        };
      }, false);

      await commentService.voteComment(id, data);
    } catch (error) {
      console.error('Failed to vote comment:', error);
      await mutate(); // Revert on error
      throw error;
    }
  };

  const unvoteComment = async (id: number) => {
    if (!checkPermission()) return;
    try {
      // Optimistic update
      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: updateCommentInTree(currentData.data, id, (comment) => {
            const currentVote = comment.userVote;
            let upvoteCount = comment.upvoteCount;
            let downvoteCount = comment.downvoteCount;

            if (currentVote === 1) upvoteCount--;
            if (currentVote === -1) downvoteCount--;

            return {
              ...comment,
              userVote: null,
              upvoteCount,
              downvoteCount,
              voteScore: upvoteCount - downvoteCount,
            };
          }),
        };
      }, false);

      await commentService.unvoteComment(id);
    } catch (error) {
      console.error('Failed to unvote comment:', error);
      await mutate(); // Revert on error
      throw error;
    }
  };

  const reportComment = async (
    id: number,
    data: ReportProblemCommentRequest
  ) => {
    if (!checkPermission()) return;
    try {
      await commentService.reportComment(id, data);
    } catch (error) {
      console.error('Failed to report comment:', error);
      throw error;
    }
  };

  const fetchReplies = async (id: number) => {
    try {
      const commentWithReplies = await commentService.getComment(id);
      await mutate((currentData: any) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: updateCommentInTree(
            currentData.data,
            id,
            () => commentWithReplies
          ),
        };
      }, false);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      throw error;
    }
  };

  return {
    comments: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    page,
    setPage,
    sortBy,
    setSortBy,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    unvoteComment,
    reportComment,
    fetchReplies,
  };
}
