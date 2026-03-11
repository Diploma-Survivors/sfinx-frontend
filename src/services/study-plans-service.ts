import clientApi from "@/lib/apis/axios-client";
import type { ApiResponse } from "@/types/api";
import type {
  FilterStudyPlanDto,
  StudyPlanListItemResponseDto,
  EnrolledPlanResponseDto,
  StudyPlanDetailResponseDto,
  StudyPlanProgressResponseDto,
  StudyPlanCardResponseDto,
  LeaderboardEntryResponseDto
} from "@/types/study-plans";
import type { AxiosResponse } from "axios";
import qs from "qs";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

async function getStudyPlans(
  filters: FilterStudyPlanDto,
  lang?: string
): Promise<AxiosResponse<ApiResponse<PaginatedResponse<StudyPlanListItemResponseDto>>>> {
  const params = qs.stringify({ ...filters, lang }, { allowDots: true, skipNulls: true });
  const endpoint = "/study-plans";
  const url = params ? `${endpoint}?${params}` : endpoint;
  return await clientApi.get<ApiResponse<PaginatedResponse<StudyPlanListItemResponseDto>>>(url);
}

async function getEnrolledPlans(lang?: string): Promise<
  AxiosResponse<ApiResponse<EnrolledPlanResponseDto[]>>
> {
  return await clientApi.get<ApiResponse<EnrolledPlanResponseDto[]>>("/study-plans/enrolled/me", { params: { lang } });
}

async function getStudyPlanDetail(
  idOrSlug: string,
  lang?: string
): Promise<AxiosResponse<ApiResponse<StudyPlanDetailResponseDto>>> {
  return await clientApi.get<ApiResponse<StudyPlanDetailResponseDto>>(`/study-plans/${idOrSlug}`, { params: { lang } });
}

async function enrollStudyPlan(
  id: number,
  lang?: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.post<ApiResponse<void>>(`/study-plans/${id}/enroll`, {}, { params: { lang } });
}

async function unenrollStudyPlan(
  id: number,
  lang?: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.delete<ApiResponse<void>>(`/study-plans/${id}/enroll`, { params: { lang } });
}

async function getStudyPlanProgress(
  id: number,
  lang?: string
): Promise<AxiosResponse<ApiResponse<StudyPlanProgressResponseDto>>> {
  return await clientApi.get<ApiResponse<StudyPlanProgressResponseDto>>(`/study-plans/${id}/progress`, { params: { lang } });
}

async function getSimilarPlans(
  id: number,
  lang?: string
): Promise<AxiosResponse<ApiResponse<StudyPlanCardResponseDto[]>>> {
  return await clientApi.get<ApiResponse<StudyPlanCardResponseDto[]>>(`/study-plans/${id}/similar`, { params: { lang } });
}

async function getLeaderboard(
  id: number,
  limit: number = 20,
  lang?: string
): Promise<AxiosResponse<ApiResponse<LeaderboardEntryResponseDto[]>>> {
  return await clientApi.get<ApiResponse<LeaderboardEntryResponseDto[]>>(`/study-plans/${id}/leaderboard`, {
    params: { limit, lang },
  });
}

export const StudyPlansService = {
  getStudyPlans,
  getEnrolledPlans,
  getStudyPlanDetail,
  enrollStudyPlan,
  unenrollStudyPlan,
  getStudyPlanProgress,
  getSimilarPlans,
  getLeaderboard,
};
