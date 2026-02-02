import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import type {
  CreateSolutionRequest,
  Solution,
  SolutionComment,
  SolutionCommentVoteType,
  SolutionListRequest,
  SolutionListResponse,
  SolutionVoteType,
} from '@/types/solutions';
import type { AxiosResponse } from 'axios';
import { type } from 'os';
import qs from 'qs';

async function getSolutionsList(
  request: SolutionListRequest
): Promise<AxiosResponse<ApiResponse<SolutionListResponse>>> {
  const { filters, ...rest } = request;
  const params = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    }
  );
  return await clientApi.get<ApiResponse<SolutionListResponse>>(
    `/solutions?${params}`
  );
}

async function getAllSolutions(
  userId: number
): Promise<AxiosResponse<ApiResponse<Solution[]>>> {
  return await clientApi.get<ApiResponse<Solution[]>>(
    `/users/${userId}/solutions`
  );
}

async function getSolutionDetail(
  id: string
): Promise<AxiosResponse<ApiResponse<Solution>>> {
  return await clientApi.get<ApiResponse<Solution>>(`/solutions/${id}`);
}

async function reactSolution(
  id: string,
  voteType: SolutionVoteType
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.post<ApiResponse<void>>(`/solutions/${id}/vote`, {
    voteType,
  });
}

async function unreactSolution(
  id: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.delete<ApiResponse<void>>(`/solutions/${id}/vote`);
}

async function getComments(
  solutionId: string
): Promise<AxiosResponse<ApiResponse<SolutionComment[]>>> {
  return await clientApi.get<ApiResponse<SolutionComment[]>>(
    `/solutions/${solutionId}/comments`
  );
}

async function createComment(
  solutionId: string,
  content: string,
  parentId?: string
): Promise<AxiosResponse<ApiResponse<SolutionComment>>> {
  return await clientApi.post<ApiResponse<SolutionComment>>(
    `/solutions/${solutionId}/comments`,
    {
      content,
      parentId,
    }
  );
}

async function reactComment(
  commentId: string,
  voteType: SolutionCommentVoteType
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.post<ApiResponse<void>>(
    `/solutions/comments/${commentId}/vote`,
    { voteType }
  );
}

async function unreactComment(
  commentId: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.delete<ApiResponse<void>>(
    `/solutions/comments/${commentId}/vote`
  );
}

async function deleteComment(
  commentId: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.delete<ApiResponse<void>>(
    `/solutions/comments/${commentId}`
  );
}

async function updateComment(
  commentId: string,
  content: string
): Promise<AxiosResponse<ApiResponse<SolutionComment>>> {
  return await clientApi.put<ApiResponse<SolutionComment>>(
    `/solutions/comments/${commentId}`,
    { content }
  );
}

async function createSolution(
  request: CreateSolutionRequest
): Promise<AxiosResponse<ApiResponse<Solution>>> {
  return await clientApi.post<ApiResponse<Solution>>('/solutions', request);
}

async function deleteSolution(
  solutionId: string
): Promise<AxiosResponse<ApiResponse<void>>> {
  return await clientApi.delete<ApiResponse<void>>(`/solutions/${solutionId}`);
}

async function updateSolution(
  solutionId: string,
  request: CreateSolutionRequest
): Promise<AxiosResponse<ApiResponse<Solution>>> {
  return await clientApi.put<ApiResponse<Solution>>(
    `/solutions/${solutionId}`,
    request
  );
}

export const SolutionsService = {
  getSolutionsList,
  getSolutionDetail,
  reactSolution,
  unreactSolution,
  getComments,
  createComment,
  reactComment,
  unreactComment,
  createSolution,
  deleteComment,
  updateComment,
  deleteSolution,
  updateSolution,
  getAllSolutions,
};
