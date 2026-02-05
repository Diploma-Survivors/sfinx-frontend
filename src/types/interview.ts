export enum InterviewStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface ProblemSnapshot {
  title: string;
  description: string;
  difficulty: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface InterviewMessage {
  id: string;
  interviewId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  userId: number;
  problemId: number;
  problemSnapshot: ProblemSnapshot;
  status: InterviewStatus;
  startedAt: string;
  endedAt?: string;
  messages?: InterviewMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluation?: any;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  problemSolvingScore: number;
  codeQualityScore: number;
  communicationScore: number;
  technicalScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  createdAt: string;
}

export interface StartInterviewResponse {
  interviewId: string;
  greeting: string;
}

export interface LiveKitTokenResponse {
  token: string;
  roomName: string;
  url: string;
}

export interface SendMessageRequest {
  content: string;
  type?: 'text' | 'code_review';
  /** Current code snapshot - sent with every message so AI has full context */
  code?: string;
  /** Programming language of the code */
  language?: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CodeSnapshot {
  code: string;
  language: string;
  timestamp: number;
}
