import clientApi from '@/lib/apis/axios-client';
import { store } from '@/store';
import { setLanguages } from '@/store/slides/workspace-slice';
import { ApiResponse } from '@/types/api';
import {
  type GetSubmissionListRequest,
  type Language,
  type Submission,
  SubmissionListResponse,
  type SubmissionRequest,
  SubmissionStatus,
} from '@/types/submissions';
import qs from 'qs';

async function run(submissionRequest: SubmissionRequest) {
  return await clientApi.post('/submissions/run', submissionRequest);
}

async function submit(submissionRequest: SubmissionRequest) {
  const { contestId, ...payload } = submissionRequest;
  let path = '/submissions/submit';
  if (contestId) {
    path = `/contests/${contestId}/submissions`;
  }
  return await clientApi.post(path, payload);
}

let languageListPromise: Promise<Language[]> | null = null;

async function getLanguageList() {
  const state = store.getState();
  const cachedLanguages = state.workspace.languages;

  if (cachedLanguages && cachedLanguages.length > 0) {
    return cachedLanguages;
  }

  if (languageListPromise) {
    return languageListPromise;
  }

  languageListPromise = clientApi
    .get<ApiResponse<Language[]>>('/programming-languages/active')
    .then((response) => {
      store.dispatch(setLanguages(response.data.data));
      languageListPromise = null;
      return response.data.data;
    })
    .catch((error) => {
      console.warn('API failed, using mock languages', error);
      languageListPromise = null;
      return [];
    });

  return languageListPromise;
}

async function getSubmissionList(
  submissionListRequest: GetSubmissionListRequest,
  problemId: number,
  contestId?: number
) {
  const { filters, ...rest } = submissionListRequest;
  const queryString = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    }
  );
  let url = '';
  if (contestId) {
    url = queryString
      ? `/contests/${contestId}/my-submissions?problemId=${problemId}&${queryString}`
      : `/contests/${contestId}/my-submissions?problemId=${problemId}`;
  } else {
    url = queryString
      ? `/submissions/user/me?problemId=${problemId}&${queryString}`
      : `/submissions/user/me?problemId=${problemId}`;
  }

  return await clientApi.get<ApiResponse<SubmissionListResponse>>(url);
}

async function getSubmissionById(submissionId: number) {
  return await clientApi.get<ApiResponse<Submission>>(
    `/submissions/${submissionId}`
  );
}

async function getAllSubmissions(userId: number): Promise<Submission[]> {
  // Mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Seed random with userId to get consistent results for the same user
      // Simple pseudo-random generator
      const seed = userId;
      const random = () => {
        const x = Math.sin(seed + Math.random()) * 10000;
        return x - Math.floor(x);
      };

      const submissionCount = Math.floor(Math.random() * 50) + 10; // 10 to 60 submissions

      const submissions: Submission[] = Array.from({
        length: submissionCount,
      }).map((_, i) => {
        const statuses = [
          SubmissionStatus.ACCEPTED,
          SubmissionStatus.WRONG_ANSWER,
          SubmissionStatus.RUNTIME_ERROR,
          SubmissionStatus.TIME_LIMIT_EXCEEDED,
          SubmissionStatus.COMPILATION_ERROR,
        ];
        // Weighted random status (more accepted and wrong answer)
        const statusWeights = [0.4, 0.3, 0.1, 0.1, 0.1];
        let status = SubmissionStatus.ACCEPTED;
        const r = Math.random();
        let sum = 0;
        for (let j = 0; j < statuses.length; j++) {
          sum += statusWeights[j];
          if (r < sum) {
            status = statuses[j];
            break;
          }
        }

        const daysAgo = Math.floor(Math.random() * 365);
        const createdAt = new Date(
          Date.now() - daysAgo * 24 * 60 * 60 * 1000
        ).toISOString();

        return {
          id: i + 1,
          status,
          executionTime: Math.floor(Math.random() * 1000),
          memoryUsed: Math.floor(Math.random() * 10000),
          testcasesPassed:
            status === SubmissionStatus.ACCEPTED
              ? 10
              : Math.floor(Math.random() * 10),
          totalTestcases: 10,
          testcaseResults: [],
          failedResult: {
            message: 'Wrong Answer',
            input: '1 2',
            expectedOutput: '3',
            actualOutput: '4',
            stderr: '',
            compileOutput: '',
          },
          user: {
            id: userId,
            firstName: 'User',
            lastName: `${userId}`,
            email: `user${userId}@example.com`,
          },
          problem: {
            id: Math.floor(Math.random() * 100 + 1),
            title: `Problem ${Math.floor(Math.random() * 100 + 1)}`,
            slug: `problem-${Math.floor(Math.random() * 100 + 1)}`,
          },
          compileError: '',
          runtimeError: '',
          submittedAt: createdAt,
          problemId: Math.floor(Math.random() * 100 + 1),
          languageId: 1,
          sourceCode: 'print("Hello World")',
        };
      });
      resolve(submissions);
    }, 500);
  });
}

async function getAllContestSubmissions(
  contestId: string,
  userId: number
): Promise<Submission[]> {
  // Mock data - similar to getAllSubmissions but conceptually for a specific contest
  return getAllSubmissions(userId);
}

export const SubmissionsService = {
  run,
  submit,
  getLanguageList,
  getSubmissionList,
  getSubmissionById,
  getAllSubmissions,
  getAllContestSubmissions,
};
