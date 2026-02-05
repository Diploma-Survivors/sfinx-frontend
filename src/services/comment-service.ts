import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import type {
  CreateProblemCommentRequest,
  GetProblemCommentsParams,
  ProblemComment,
  ProblemCommentListResponse,
  ReportProblemCommentRequest,
  UpdateProblemCommentRequest,
  VoteProblemCommentRequest,
} from '@/types/comments';
import qs from 'qs';

async function getComments(
  problemId: string | number,
  params?: GetProblemCommentsParams
) {
  const queryParams = qs.stringify(params, { skipNulls: true });
  const url = `/problems/${problemId}/comments${queryParams ? `?${queryParams}` : ''}`;
  const response =
    await clientApi.get<ApiResponse<ProblemCommentListResponse>>(url);
  return response.data.data;
}

async function getComment(id: number) {
  const response = await clientApi.get<ApiResponse<ProblemComment>>(
    `/problems/comments/${id}`
  );
  return response.data.data;
}

async function createComment(
  problemId: string | number,
  data: CreateProblemCommentRequest
) {
  const response = await clientApi.post<ApiResponse<ProblemComment>>(
    `/problems/${problemId}/comments`,
    data
  );
  return response.data.data;
}

async function updateComment(id: number, data: UpdateProblemCommentRequest) {
  const response = await clientApi.patch<ApiResponse<ProblemComment>>(
    `/problems/comments/${id}`,
    data
  );
  return response.data.data;
}

async function deleteComment(id: number) {
  await clientApi.delete(`/problems/comments/${id}`);
}

async function voteComment(id: number, data: VoteProblemCommentRequest) {
  await clientApi.post(`/problems/comments/${id}/vote`, data);
}

async function unvoteComment(id: number) {
  await clientApi.delete(`/problems/comments/${id}/vote`);
}

async function reportComment(id: number, data: ReportProblemCommentRequest) {
  await clientApi.post(`/problems/comments/${id}/report`, data);
}

export const commentService = {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  voteComment,
  unvoteComment,
  reportComment,
};
