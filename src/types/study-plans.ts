import type { Tag, Topic, Problem } from "./problems";

export enum StudyPlanDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum StudyPlanStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

export enum StudyPlanSortBy {
  CREATED_AT = "createdAt",
  ENROLLMENT_COUNT = "enrollmentCount",
  ESTIMATED_DAYS = "estimatedDays",
  NAME = "name",
}

export interface StudyPlanCardResponseDto {
  id: number;
  slug: string;
  name: string;
  difficulty: StudyPlanDifficulty;
  coverImageUrl: string | null;
  estimatedDays: number;
  isPremium: boolean;
}

export interface StudyPlanListItemResponseDto extends StudyPlanCardResponseDto {
  totalProblems: number;
  isEnrolled: boolean;
  solvedCount: number;
  enrollmentStatus: EnrollmentStatus | null;
}

export interface StudyPlanItemResponseDto {
  id: number;
  dayNumber: number;
  orderIndex: number;
  note: string | null;
  problem: Problem;
  progressStatus: string | null;
}

export interface StudyPlanDayResponseDto {
  dayNumber: number;
  items: StudyPlanItemResponseDto[];
}

export interface StudyPlanDetailResponseDto extends StudyPlanCardResponseDto {
  description: string | null;
  enrollmentCount: number;
  topics: Topic[];
  tags: Tag[];
  totalProblems: number;
  isEnrolled: boolean;
  solvedCount: number;
  enrollmentStatus: EnrollmentStatus | null;
  days: StudyPlanDayResponseDto[];
}

export interface EnrolledPlanResponseDto extends StudyPlanCardResponseDto {
  enrollmentStatus: EnrollmentStatus;
  currentDay: number;
  totalProblems: number;
  solvedCount: number;
  lastActivityAt: Date | null;
  completedAt: Date | null;
  enrolledAt: Date;
}

export interface StudyPlanProgressResponseDto extends StudyPlanCardResponseDto {
  enrollmentStatus: EnrollmentStatus;
  currentDay: number;
  solvedCount: number;
  totalProblems: number;
  progressPercentage: number;
  completedAt: Date | null;
  enrolledAt: Date;
  days: StudyPlanDayResponseDto[];
}

export interface LeaderboardEntryResponseDto {
  rank: number;
  userId: number;
  username: string | null;
  fullName: string | null;
  avatarKey: string | null;
  solvedCount: number;
  totalProblems: number;
  progressPercentage: number;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
}

// Custom request types
export interface FilterStudyPlanDto {
  status?: StudyPlanStatus;
  difficulty?: StudyPlanDifficulty;
  isPremium?: boolean;
  topicIds?: number[];
  tagIds?: number[];
  search?: string;
  sortBy?: StudyPlanSortBy;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}
