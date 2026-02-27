import clientApi from "@/lib/apis/axios-client";
import type { ApiResponse } from "@/types/api";
import {
  CONTEST_STATUS_COLORS,
  type Contest,
  type ContestListRequest,
  type ContestListResponse,
  ContestStatus,
  ContestUserStatus,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from "@/types/contests";
import type { AxiosResponse } from "axios";
import qs from "qs";

async function getContestList(
  getContestListRequest: ContestListRequest,
): Promise<AxiosResponse<ApiResponse<ContestListResponse>>> {
  const queryString = qs.stringify(getContestListRequest, {
    allowDots: true,
    skipNulls: true,
  });

  const url = queryString ? `/contests?${queryString}` : "/contests";
  return await clientApi.get(url);
}

async function getContestDetail(id: string) {
  const response = await clientApi.get<ApiResponse<Contest>>(`/contests/${id}`);

  response.data.data.contestProblems = [
    ...response.data.data.contestProblems,
  ].sort((a, b) => a.orderIndex - b.orderIndex);

  return response;
}

async function getContestOverview(id: string) {
  return await clientApi.get(`/contests/${id}/overview`);
}

async function finishContest(id: string) {
  return await clientApi.post(`/contests/${id}/finish`);
}

async function participateContest(id: string) {
  return await clientApi.post(`/contests/${id}/enter`);
}

async function getContestLeaderboard(
  id: string,
  params?: { page?: number; limit?: number; search?: string },
): Promise<AxiosResponse<ApiResponse<LeaderboardResponse>>> {
  const queryString = qs.stringify(params, {
    allowDots: true,
    skipNulls: true,
  });
  const url = queryString
    ? `/contests/${id}/leaderboard?${queryString}`
    : `/contests/${id}/leaderboard`;
  return await clientApi.get(url);
}

async function getContestLeaderboardMe(
  id: string,
): Promise<AxiosResponse<ApiResponse<LeaderboardEntry>>> {
  return await clientApi.get(`/contests/${id}/leaderboard/me`);
}

function isInProgress(contest: Contest): boolean {
  return (
    contest.status === ContestStatus.RUNNING &&
    contest.userStatus === ContestUserStatus.JOINED
  );
}

function getContestStatusColor(status: ContestStatus): string {
  switch (status) {
    case ContestStatus.SCHEDULED:
      return CONTEST_STATUS_COLORS.upcoming;
    case ContestStatus.RUNNING:
      return CONTEST_STATUS_COLORS.ongoing;
    case ContestStatus.ENDED:
      return CONTEST_STATUS_COLORS.finished;
    default:
      return CONTEST_STATUS_COLORS.finished;
  }
}

export const ContestsService = {
  getContestList,
  getContestDetail,
  getContestStatusColor,
  getContestOverview,
  isInProgress,
  participateContest,
  getContestLeaderboard,
  getContestLeaderboardMe,
};
