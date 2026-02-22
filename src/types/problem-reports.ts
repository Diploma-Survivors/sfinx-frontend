export enum ProblemReportType {
    WRONG_DESCRIPTION = "WRONG_DESCRIPTION",
    WRONG_ANSWER = "WRONG_ANSWER",
    WRONG_TEST_CASE = "WRONG_TEST_CASE",
    OTHER = "OTHER",
}

export enum ProblemReportStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED",
}

export interface ProblemReport {
    id: string;
    problemId: number;
    userId: number;
    type: ProblemReportType;
    description: string;
    status: ProblemReportStatus;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        username: string;
        fullName?: string;
        avatarUrl?: string; // or avatarKey
    };
    problem?: {
        id: number;
        title: string;
    };
}

export interface CreateProblemReportRequest {
    problemId: number;
    type: ProblemReportType;
    description: string;
}

export interface UpdateProblemReportRequest {
    status: ProblemReportStatus;
}
