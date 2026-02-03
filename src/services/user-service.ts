import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import {
  ProblemDifficulty,
  ProblemStatus,
  initialProblemData,
} from '@/types/problems';
import { SubmissionStatus } from '@/types/submissions';
import {
  type AvatarUploadUrlRequest,
  type AvatarUploadUrlResponse,
  type ConfirmAvatarUploadRequest,
  type PracticeHistoryParams,
  PracticeHistorySortBy,
  type UpdateUserProfileRequest,
  type UserActivityCalendar,
  UserPracticeHistoryItem,
  type UserPracticeHistoryResponse,
  type UserProblemStats,
  type UserProfile,
  type UserRecentACProblem,
  type UserSolutionsResponse,
  type UserSubmissionStats,
} from '@/types/user';
import type { AxiosResponse } from 'axios';

async function getUserProfile(
  userId: number
): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  return await clientApi.get<ApiResponse<UserProfile>>(
    `/users/profile?userId=${userId}`
  );
}

async function getMe(): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  return await clientApi.get<ApiResponse<UserProfile>>(`/auth/me`);
}

async function updateMe(
  data: UpdateUserProfileRequest
): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
  return await clientApi.patch<ApiResponse<UserProfile>>(`/auth/me`, data);
}

async function getAvatarUploadUrl(
  data: AvatarUploadUrlRequest
): Promise<AxiosResponse<ApiResponse<AvatarUploadUrlResponse>>> {
  return await clientApi.post<ApiResponse<AvatarUploadUrlResponse>>(
    `/auth/me/avatar/upload-url`,
    data
  );
}

async function confirmAvatarUpload(
  data: ConfirmAvatarUploadRequest
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.post<ApiResponse<void>>(
    `/auth/me/avatar/confirm`,
    data
  );
}

async function getUserStats(userId: number): Promise<
  AxiosResponse<
    ApiResponse<{
      problemStats: UserProblemStats;
      submissionStats: UserSubmissionStats;
    }>
  >
> {
  return await clientApi.get(`/users/${userId}/stats`);
}

async function getUserActivityCalendar(
  userId: number,
  year: number
): Promise<AxiosResponse<ApiResponse<UserActivityCalendar>>> {
  return await clientApi.get(`/users/${userId}/activity-calendar`, {
    params: { year },
  });
}

async function getUserActivityYears(
  userId: number
): Promise<AxiosResponse<ApiResponse<number[]>>> {
  return await clientApi.get(`/users/${userId}/activity-years`);
}

async function getUserRecentACProblems(
  userId: number
): Promise<AxiosResponse<ApiResponse<UserRecentACProblem[]>>> {
  return await clientApi.get(`/users/${userId}/recent-ac-problems`);
}

async function getUserPracticeHistory(
  userId: number,
  params: PracticeHistoryParams
): Promise<AxiosResponse<ApiResponse<UserPracticeHistoryResponse>>> {
  return await clientApi.get(`/users/${userId}/practice-history`, {
    params,
  });
}

async function getUserSolutions(
  userId: number,
  params: { page?: number; limit?: number; sortBy?: string }
): Promise<AxiosResponse<ApiResponse<UserSolutionsResponse>>> {
  return await clientApi.get(`/solutions/user/${userId}`, {
    params,
  });
}

export const UserService = {
  getUserProfile,
  getMe,
  updateMe,
  getAvatarUploadUrl,
  confirmAvatarUpload,
  getUserStats,
  getUserActivityCalendar,
  getUserActivityYears,
  getUserRecentACProblems,
  getUserPracticeHistory,
  getUserSolutions,
};
