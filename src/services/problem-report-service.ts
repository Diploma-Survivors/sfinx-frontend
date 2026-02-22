import clientApi from "@/lib/apis/axios-client";
import type { ApiResponse } from "@/types/api";
import type {
    CreateProblemReportRequest,
    ProblemReport,
    UpdateProblemReportRequest,
} from "@/types/problem-reports";
import type { AxiosResponse } from "axios";

async function createReport(
    request: CreateProblemReportRequest,
): Promise<AxiosResponse<ApiResponse<ProblemReport>>> {
    return await clientApi.post<ApiResponse<ProblemReport>>(
        "/problem-reports",
        request,
    );
}

export const ProblemReportService = {
    createReport,
};
