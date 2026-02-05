export interface ContestProblemStatus {
  problemId: string;
  status: 'unsolved' | 'attempted' | 'solved';
  score?: number;
  attempts?: number;
}

export interface ContestRanking {
  rank: number;
  username: string;
  score: number;
  timeSpent: string;
  problemsSolved: number;
  isCurrentUser?: boolean;
  avatar?: string;
  country?: string;
  progress?: boolean[];
}

export interface SubmissionResult {
  id: string;
  status:
    | 'pending'
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'memory_limit_exceeded'
    | 'runtime_error'
    | 'compilation_error';
  language: string;
  runtime?: number;
  memory?: number;
  submittedAt: string;
  testcasesPassed?: number;
  totalTestcases?: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface TestResult {
  status: 'running' | 'passed' | 'failed' | 'error';
  message?: string;
  testcases?: TestCase[];
}

export interface ContestSolveData {
  contestId: string;
  contestName: string;
  endTime: string;
  currentProblem: {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    score: number;
    description: string;
    inputDescription: string;
    outputDescription: string;
    constraints?: string;
    samples?: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
  };
  problems: Array<{
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    score: number;
    status: 'unsolved' | 'attempted' | 'solved';
  }>;
  ranking: ContestRanking[];
}
