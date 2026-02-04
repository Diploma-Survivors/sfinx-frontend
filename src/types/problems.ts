import type { Tag } from './tags';
import type { SampleTestCase } from './testcases';
import type { Topic } from './topics';
import type { UserProfile } from './user';

export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum SortBy {
  ID = 'id',
  DIFFICULTY = 'difficulty',
  ACCEPTANCE_RATE = 'acceptanceRate',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProblemStatus {
  NOT_STARTED = 'not-started',
  ATTEMPTED = 'attempted',
  SOLVED = 'solved',
}

export interface ProblemFilters {
  difficulty?: ProblemDifficulty;
  isActive?: boolean;
  isPremium?: boolean;
  status?: ProblemStatus;
  topicIds?: number[];
  tagIds?: number[];
}

export interface GetProblemListRequest {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
  sortBy?: SortBy;
  filters?: ProblemFilters;
  search?: string;
}

export interface ProblemListItem {
  id: number;
  title: string;
  difficulty: ProblemDifficulty;
  tags: Tag[];
  topics: Topic[];
  status?: ProblemStatus;
  acceptanceRate?: number;
}

// UI helpers removed in favor of component-level i18n and design system tokens
export const DIFFICULTY_COLORS = {
  [ProblemDifficulty.EASY]:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  [ProblemDifficulty.MEDIUM]:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  [ProblemDifficulty.HARD]:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
};

export const getDifficultyColor = (difficulty: ProblemDifficulty | string) => {
  const normalized = (difficulty || '').toLowerCase() as ProblemDifficulty;
  return (
    DIFFICULTY_COLORS[normalized] ||
    'bg-slate-100 text-slate-700 border-slate-200'
  );
};

export interface Hint {
  order: number;
  content: string;
}

export interface Problem {
  id: number;
  title: string;
  slug?: string;
  description: string;
  constraints: string;
  difficulty: ProblemDifficulty;
  isPremium: boolean;
  isPublished?: boolean;
  isActive: boolean;
  status: ProblemStatus;
  totalSubmissions?: number;
  totalAccepted?: number;
  acceptanceRate?: string;
  totalAttempts?: number;
  totalSolved?: number;
  averageTimeToSolve?: number;
  difficultyRating?: number;
  testcaseFileKey?: any;
  testcaseCount?: number;
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleTestcases: SampleTestCase[];
  hints?: Hint[];
  hasOfficialSolution?: boolean;
  officialSolutionContent?: string;
  createdBy?: UserProfile;
  updatedBy?: UserProfile;
  similarProblems?: number[];
  topics: Topic[];
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;

  // Legacy/Form fields (optional to avoid breaking UI immediately)
  inputDescription?: string;
  outputDescription?: string;
  testcase?: File | null;
  testcaseSamples?: SampleTestCase[]; // Alias for sampleTestcases?
  testcaseFileUrl?: string;
}

export interface ProblemMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProblemListResponse {
  data: Problem[];
  meta: ProblemMeta;
}

export const initialProblemData: Problem = {
  id: 0,
  title: '',
  slug: '',
  description: '',
  constraints: '',
  difficulty: ProblemDifficulty.EASY,
  isPremium: false,
  isPublished: true,
  isActive: true,
  status: ProblemStatus.NOT_STARTED,
  totalSubmissions: 0,
  totalAccepted: 0,
  acceptanceRate: '0',
  totalAttempts: 0,
  totalSolved: 0,
  averageTimeToSolve: 0,
  difficultyRating: 0,
  testcaseFileKey: {},
  testcaseCount: 0,
  timeLimitMs: 1000,
  memoryLimitKb: 256000,
  sampleTestcases: [],
  hints: [],
  hasOfficialSolution: false,
  officialSolutionContent: '',
  createdBy: {} as UserProfile, // Placeholder
  updatedBy: {} as UserProfile, // Placeholder
  similarProblems: [],
  topics: [],
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Legacy
  inputDescription: '',
  outputDescription: '',
  testcase: null,
  testcaseSamples: [],
};
