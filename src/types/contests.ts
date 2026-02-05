import { CheckCircle, FileText } from 'lucide-react';
import { JSX } from 'react';
import type { Problem, ProblemDifficulty, SortOrder } from './problems';

export enum ContestSortBy {
  ID = 'id',
  START_TIME = 'startTime',
}

export enum MatchMode {
  ANY = 'any',
  ALL = 'all',
}

export enum ContestProblemStatus {
  SOLVED = 'SOLVED',
  ATTEMPTED = 'ATTEMPTED',
  NOT_STARTED = 'NOT_STARTED',
}

export const ContestProblemStatusTooltip: Record<ContestProblemStatus, string> =
  {
    [ContestProblemStatus.NOT_STARTED]: 'Not Started',
    [ContestProblemStatus.SOLVED]: 'Solved',
    [ContestProblemStatus.ATTEMPTED]: 'Attempted',
  };

// Contest Detail types
export interface ContestProblem {
  id: string;
  title: string;
  maxScore: number;
  userScore?: number;
  status: ContestProblemStatus;
  difficulty: ProblemDifficulty;
  memoryLimitKb: number;
  timeLimitMs: number;
}

export enum ContestDeadlineEnforcement {
  STRICT = 'strict',
  FLEXIBLE = 'flexible',
}

export enum ContestSubmissionStrategy {
  SINGLE_SUBMISSION = 'SINGLE_SUBMISSION',
  BEST_SCORE = 'BEST_SCORE',
  LATEST_SCORE = 'LATEST_SCORE',
  AVERAGE_SCORE = 'AVERAGE_SCORE',
}

export enum ContestStatus {
  SCHEDULED = 'Scheduled',
  RUNNING = 'Running',
  ENDED = 'Ended',
}

export interface ContestParticipation {
  participationId?: number;
  startTime?: string;
  endTime?: string;
  finishedAt?: string;
  finalScore?: number;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participantCount?: number;
  maxParticipant?: number;
  durationMinutes?: number;
  // problems: {
  //   problem: Problem;
  //   orderIndex: number;
  //   points?: number;
  // }[];
  createdBy?: string;
  createdAt?: string;
  status: ContestStatus; // derived field for UI convenience
  userStatus: ContestUserStatus;
  contestProblems: {
    problem: Problem;
    orderIndex: number;
    points?: number;
  }[];
  participation?: ContestParticipation;
  lateDeadline?: string;
}

export interface ContestOverView {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  lateDeadline?: string;
  deadlineEnforcement: ContestDeadlineEnforcement;
  submissionStrategy: ContestSubmissionStrategy;
  totalProblems: number;
  participationCount: number;
  hasParticipated: boolean;
  author?: User;
  createdBy?: string;
  createdAt?: string;
}

export enum ContestUserStatus {
  JOINED = 'JOINED',
  NOT_JOINED = 'NOT_JOINED',
}

// Filter types
export interface ContestFilters {
  userStatus?: ContestUserStatus;
  status?: ContestStatus;
  startAfter?: string;
  startBefore?: string;
}

// Request types
export interface ContestListRequest {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  sortBy?: ContestSortBy;
  search?: string;
  status?: ContestStatus;
  userStatus?: ContestUserStatus;
  startAfter?: string;
  startBefore?: string;
}

// Response types
export interface ContestListResponse {
  data: Contest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const ContestStatusLabels: Record<ContestStatus, string> = {
  [ContestStatus.SCHEDULED]: 'Scheduled',
  [ContestStatus.RUNNING]: 'Running',
  [ContestStatus.ENDED]: 'Ended',
};

export const CONTEST_SUBMISSION_STRATEGY_LABELS: Record<
  ContestSubmissionStrategy,
  string
> = {
  [ContestSubmissionStrategy.SINGLE_SUBMISSION]: 'Single Submission',
  [ContestSubmissionStrategy.BEST_SCORE]: 'Best Score',
  [ContestSubmissionStrategy.LATEST_SCORE]: 'Latest Score',
  [ContestSubmissionStrategy.AVERAGE_SCORE]: 'Average Score',
};

export const CONTEST_SUBMISSION_STRATEGY_DESCRIPTION: Record<
  ContestSubmissionStrategy,
  string
> = {
  [ContestSubmissionStrategy.SINGLE_SUBMISSION]:
    'Only one submission is allowed for each problem',
  [ContestSubmissionStrategy.BEST_SCORE]:
    'The best score from all submissions is taken',
  [ContestSubmissionStrategy.LATEST_SCORE]:
    'The latest submission score is taken',
  [ContestSubmissionStrategy.AVERAGE_SCORE]:
    'The average score from all submissions is taken',
};

export const CONTEST_ACCESS_RANGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

export interface ContestProblemDTO {
  problemId: string;
  score: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  country: string;
  rating: number;
  attendedContests: number;
  rank: number;
}

export const CONTEST_STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  finished: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  public:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  private:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const CONTEST_STATUS_LABELS = {
  [ContestStatus.SCHEDULED]: 'Upcoming',
  [ContestStatus.RUNNING]: 'Running',
  [ContestStatus.ENDED]: 'Ended',
} as const;

export const PARTICIPATION_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'yes', label: 'Đã tham gia' },
  { value: 'no', label: 'Chưa tham gia' },
];

export enum ContestNavTabs {
  DESCRIPTION = 'description',
  SUBMISSIONS = 'submissions',
}

export const CONTEST_NAV_TABS_DETAIL = [
  { id: ContestNavTabs.DESCRIPTION, label: 'Problem', icon: FileText },
  { id: ContestNavTabs.SUBMISSIONS, label: 'Submissions', icon: CheckCircle },
];

export const INITIAL_CONTEST: Contest = {
  id: 0,
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  participantCount: 0,
  maxParticipant: 0,
  durationMinutes: 0,
  contestProblems: [],
  userStatus: ContestUserStatus.NOT_JOINED,
  status: ContestStatus.SCHEDULED,
};

export interface ProblemStatus {
  problemId: number;
  problemOrder: number; // Q1, Q2, etc.
  status: ContestProblemStatus;
  score?: number;
  time?: string; // Time of submission or time taken
  attempts?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
    fullName?: string;
  };
  totalScore: number;
  totalTime: string; // Format: HH:MM:SS
  problemStatus: ProblemStatus[];
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
