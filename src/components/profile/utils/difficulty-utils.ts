import { ProblemDifficulty, ProblemStatus } from '@/types/problems';
import { SubmissionStatus } from '@/types/submissions';

export const getDifficultyStyles = (difficulty: ProblemDifficulty): string => {
    switch (difficulty) {
        case ProblemDifficulty.EASY:
            return 'text-green-600 bg-green-50 border-green-200';
        case ProblemDifficulty.MEDIUM:
            return 'bg-yellow-100 text-yellow-800 border-orange-200';
        case ProblemDifficulty.HARD:
            return 'text-red-600 bg-red-50 border-red-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

export const getStatusColor = (
    status: SubmissionStatus | ProblemStatus
): string => {
    if (
        status === ProblemStatus.SOLVED ||
        status === SubmissionStatus.ACCEPTED
    ) {
        return 'text-green-600';
    }
    if (
        status === SubmissionStatus.WRONG_ANSWER ||
        status === SubmissionStatus.TIME_LIMIT_EXCEEDED ||
        status === SubmissionStatus.RUNTIME_ERROR ||
        status === SubmissionStatus.COMPILATION_ERROR
    ) {
        return 'text-red-600';
    }
    return 'text-gray-600';
};
