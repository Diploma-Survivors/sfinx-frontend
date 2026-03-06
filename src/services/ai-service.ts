import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';

export interface AIReviewResponse {
  review: string;
  cached: boolean;
  generatedAt?: string;
}

export const AIService = {
  generateReview: async (
    submissionId: string,
    customPrompt?: string,
  ): Promise<string> => {
    const response = await clientApi.post<ApiResponse<AIReviewResponse>>(
      `/submissions/${submissionId}/ai-review`,
      { customPrompt },
      { timeout: 120000 }, // 120 seconds timeout for AI generation
    );
    return response.data.data.review;
  },
};
