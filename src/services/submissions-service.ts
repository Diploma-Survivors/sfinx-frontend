import clientApi from "@/lib/apis/axios-client";
import { store } from "@/store";
import { setLanguages } from "@/store/slides/workspace-slice";
import type { ApiResponse } from "@/types/api";
import {
  type GetSubmissionListRequest,
  type Language,
  type Submission,
  type SubmissionListResponse,
  type SubmissionRequest,
} from "@/types/submissions";
import qs from "qs";

async function run(submissionRequest: SubmissionRequest) {
  return await clientApi.post("/submissions/run", submissionRequest);
}

async function submit(submissionRequest: SubmissionRequest) {
  const { contestId, ...payload } = submissionRequest;
  let path = "/submissions/submit";
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
    .get<ApiResponse<Language[]>>("/programming-languages/active")
    .then((response) => {
      store.dispatch(setLanguages(response.data.data));
      languageListPromise = null;
      return response.data.data;
    })
    .catch((error) => {
      console.warn("API failed, using mock languages", error);
      languageListPromise = null;
      return [];
    });

  return languageListPromise;
}

async function getSubmissionList(
  submissionListRequest: GetSubmissionListRequest,
  problemId: number,
  contestId?: number,
) {
  const { filters, ...rest } = submissionListRequest;
  const queryString = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    },
  );
  let url = "";
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
    `/submissions/${submissionId}`,
  );
}

export const SubmissionsService = {
  run,
  submit,
  getLanguageList,
  getSubmissionList,
  getSubmissionById,
};
