import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import type {
  Interview,
  InterviewEvaluation,
  StartInterviewResponse,
  LiveKitTokenResponse,
  SendMessageRequest,
  InterviewMessage,
  CodeSnapshot,
} from '@/types/interview';
import type { AxiosResponse } from 'axios';

/**
 * Start a new AI interview session
 */
async function startInterview(problemId: number): Promise<AxiosResponse<ApiResponse<StartInterviewResponse>>> {
  return clientApi.post<ApiResponse<StartInterviewResponse>>('/ai-interviews', {
    problemId,
  });
}

/**
 * Get interview details including messages
 */
async function getInterview(interviewId: string): Promise<AxiosResponse<ApiResponse<Interview>>> {
  return clientApi.get<ApiResponse<Interview>>(`/ai-interviews/${interviewId}`);
}

/**
 * Get LiveKit token for voice connection
 */
async function getLiveKitToken(
  interviewId: string,
  displayName?: string
): Promise<AxiosResponse<ApiResponse<LiveKitTokenResponse>>> {
  return clientApi.post<ApiResponse<LiveKitTokenResponse>>('/livekit/token', {
    interviewId,
    displayName,
  });
}

/**
 * Send a text message to the AI interviewer
 */
async function sendMessage(
  interviewId: string,
  data: SendMessageRequest
): Promise<AxiosResponse<ApiResponse<InterviewMessage>>> {
  return clientApi.post<ApiResponse<InterviewMessage>>(`/ai-interviews/${interviewId}/messages`, data);
}

/**
 * Get chat history for an interview
 */
async function getChatHistory(interviewId: string): Promise<AxiosResponse<ApiResponse<InterviewMessage[]>>> {
  return clientApi.get<ApiResponse<InterviewMessage[]>>(`/ai-interviews/${interviewId}/messages`);
}

/**
 * End an interview and get evaluation
 */
async function endInterview(
  interviewId: string
): Promise<AxiosResponse<ApiResponse<InterviewEvaluation>>> {
  return clientApi.post<ApiResponse<InterviewEvaluation>>(`/ai-interviews/${interviewId}/end`);
}

/**
 * Get room status from LiveKit
 */
async function getRoomStatus(interviewId: string): Promise<AxiosResponse<ApiResponse<{ active: boolean; participants: number }>>> {
  return clientApi.get<ApiResponse<{ active: boolean; participants: number }>>(
    `/livekit/room/${interviewId}/status`
  );
}

/**
 * Send code snapshot to backend for AI context
 * This allows the AI agent to see the user's code
 */
async function syncCodeSnapshot(interviewId: string, snapshot: CodeSnapshot): Promise<void> {
  try {
    await clientApi.post(`/ai-interviews/${interviewId}/code-snapshot`, snapshot);
  } catch (error) {
    // Silently fail - code sync is non-critical
    console.warn('Failed to sync code snapshot:', error);
  }
}

/**
 * Get user's interview history
 */
async function getInterviewHistory(): Promise<AxiosResponse<ApiResponse<Interview[]>>> {
  return clientApi.get<ApiResponse<Interview[]>>('/ai-interviews');
}

export const InterviewService = {
  startInterview,
  getInterview,
  getLiveKitToken,
  sendMessage,
  getChatHistory,
  endInterview,
  getRoomStatus,
  syncCodeSnapshot,
  getInterviewHistory,
};
