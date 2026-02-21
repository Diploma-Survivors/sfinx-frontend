import type { Problem, ProblemDifficulty, ProblemStatus } from "./problems";
import type { Solution } from "./solutions";
import type { Submission, SubmissionStatus } from "./submissions";

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  preferredLanguage: string;
  googleId?: string;
  emailVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  premiumStartedAt?: string;
  premiumExpiresAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt?: Date;
  contestRank?: number;
  problemRank?: number;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  bio?: string;
  address?: string;
  phone?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  preferredLanguage?: string;
}

export interface AvatarUploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface AvatarUploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  maxSizeBytes: number;
}

export interface ConfirmAvatarUploadRequest {
  key: string;
}

export interface UserProblemStats {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  total: { solved: number; total: number };
}

export interface UserSubmissionStats {
  accepted: number;
  wrongAnswer: number;
  timeLimitExceeded: number;
  runtimeError: number;
  compilationError: number;
  others: number;
  total: number;
}

export interface UserActivityCalendar {
  totalActiveDays: number;
  activeDays: { date: string; count: number }[];
}

export interface UserRecentACProblem {
  userId: number;
  problemId: number;
  problem: Problem;
  status: ProblemStatus;
  totalAttempts: number;
  firstSolvedAt: string;
  lastAttemptedAt: string;
}

export interface UserPracticeHistoryItem {
  problem: Problem;
  status: ProblemStatus;
  lastSubmittedAt: string | null;
  lastResult: SubmissionStatus;
  submissionCount: number;
  submissions: Submission[];
}

export enum PracticeHistorySortBy {
  LAST_SUBMITTED_AT = "lastSubmittedAt",
  SUBMISSION_COUNT = "submissionCount",
}

export enum PracticeHistorySortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface PracticeHistoryParams {
  page?: number;
  limit?: number;
  status?: ProblemStatus;
  difficulty?: ProblemDifficulty;
  sortBy?: PracticeHistorySortBy;
  sortOrder?: PracticeHistorySortOrder;
}

export interface UserPracticeHistoryResponse {
  data: UserPracticeHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserSolutionsResponse {
  data: Solution[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ContestRatingUser {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ContestRatingLeaderboardEntry {
  rank: number;
  user: ContestRatingUser;
  contestRating: number;
  contestsParticipated: number;
}

export interface ContestHistoryEntry {
  contestId: number;
  contestTitle: string;
  contestEndTime: string;
  contestRank: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
}
