import type { Tag } from './tags';
import type { UserProfile } from './user';

export enum SolutionVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export interface Solution {
  id: string;
  problemId: string;
  title: string;
  authorId: number;
  author?: UserProfile;
  createdAt: string;
  updatedAt: string;
  userVote: SolutionVoteType | null;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  tags: Tag[];
  languageIds: number[];
  content: string;
}

export interface SolutionFilters {
  tagIds?: number[];
  languageIds?: number[];
}

export enum SolutionSortBy {
  RECENT = 'recent',
  MOST_VOTED = 'most_voted',
}

export interface SolutionListRequest {
  problemId: string;
  keyword?: string;
  filters?: SolutionFilters;
  sortBy?: SolutionSortBy;
  page?: number;
  limit?: number;
}

export interface SolutionEdge {
  cursor: string;
  node: Solution;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface SolutionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SolutionListResponse {
  data: Solution[];
  meta: SolutionMeta;
}

export enum SolutionCommentVoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export interface SolutionComment {
  id: string;
  solutionId: string;
  authorId: number;
  author?: UserProfile;
  content: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote: SolutionCommentVoteType | null;
  parentId: string | null;
  replyCounts: number;
  createdAt: string;
  updatedAt: string;
}

export enum SolutionCommentSortBy {
  RECENT = 'recent',
  MOST_VOTED = 'most_voted',
}

export interface CreateSolutionRequest {
  problemId: number;
  title: string;
  content: string;
  tagIds: number[];
  languageIds: number[];
}
