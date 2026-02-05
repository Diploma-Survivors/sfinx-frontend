import type { UserProfile } from './user';

export enum ProblemCommentType {
  FEEDBACK = 'Feedback',
  QUESTION = 'Question',
  TIP = 'Tip',
}

export enum ProblemCommentVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export enum ProblemCommentSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TOP = 'top',
}

export interface ProblemComment {
  id: number;
  problemId: number;
  parentId: number | null;
  content: string;
  type: ProblemCommentType;
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  upvoteCount: number;
  downvoteCount: number;
  voteScore: number;
  replyCount: number;
  reportCount: number;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: UserProfile;
  userVote: ProblemCommentVoteType | null;
  replies?: ProblemComment[];
}

export interface CreateProblemCommentRequest {
  content: string;
  type: ProblemCommentType;
  parentId?: number;
}

export interface UpdateProblemCommentRequest {
  content: string;
  type: ProblemCommentType;
}

export interface VoteProblemCommentRequest {
  voteType: ProblemCommentVoteType;
}

export interface ReportProblemCommentRequest {
  reason: string;
  description: string;
}

export interface GetProblemCommentsParams {
  page?: number;
  limit?: number;
  sortBy?: ProblemCommentSortBy;
}

export interface ProblemCommentListResponse {
  data: ProblemComment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
