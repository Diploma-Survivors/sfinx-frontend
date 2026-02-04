import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import {
  type GetProblemListRequest,
  type Problem,
  ProblemDifficulty,
  type ProblemListItem,
  type ProblemListResponse,
} from '@/types/problems';
import type { SampleTestCase } from '@/types/testcases';
import type { AxiosResponse } from 'axios';
import qs from 'qs';

async function getProblemList(
  getProblemListRequest: GetProblemListRequest
): Promise<AxiosResponse<ApiResponse<ProblemListResponse>>> {
  const { filters, ...rest } = getProblemListRequest;
  const params = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    }
  );
  const endpoint = '/problems';
  const url = params ? `${endpoint}?${params}` : endpoint;
  return await clientApi.get<ApiResponse<ProblemListResponse>>(url);
}

async function getProblemById(
  problemId: number
): Promise<AxiosResponse<ApiResponse<Problem>>> {
  const [problemResponse, samplesResponse] = await Promise.all([
    clientApi.get<ApiResponse<Problem>>(`/problems/${problemId}`),
    clientApi
      .get<ApiResponse<SampleTestCase[]>>(`/problems/${problemId}/samples`)
      .catch(() => null),
  ]);

  if (problemResponse.data?.data && samplesResponse?.data?.data) {
    problemResponse.data.data.sampleTestcases = samplesResponse.data.data;
  }
  if (problemResponse.data?.data) {
    problemResponse.data.data.hasOfficialSolution =
      !!problemResponse.data.data.officialSolutionContent;
  }

  return problemResponse;
}

export const ProblemsService = {
  getProblemList,
  getProblemById,
};
