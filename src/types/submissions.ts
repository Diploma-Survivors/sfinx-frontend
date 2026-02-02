import { Problem } from './problems';
import { UserProfile } from './user';

export enum SubmissionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  ACCEPTED = 'ACCEPTED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface Language {
  id: number;
  name: string;
  slug?: string;
  judge0Id?: number;
  monacoLanguage?: string;
  isActive: boolean;
  orderIndex?: number;
  starterCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCaseSubmission {
  input: string;
  output: string;
}

export interface SubmissionRequest {
  languageId: number;
  sourceCode: string;
  problemId: number;
  contestId?: number;
  contestParticipationId?: number;
  testCases?: TestCaseSubmission[];
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  languageId?: number;
}

export interface GetSubmissionListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  matchMode?: string;
  filters?: SubmissionFilters;
}

export interface SubmissionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SubmissionListResponse {
  data: Submission[];
  meta: SubmissionMeta;
}

export interface TestCaseResult {
  testcaseId: number;
  status: string;
  input: string;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  memoryUsed: number;
  error: string;
  stderr: string;
}

export interface FailedResult {
  message: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  compileOutput: string;
}

export interface Submission {
  id: number;
  status: SubmissionStatus;
  executionTime: number;
  memoryUsed: number;
  testcasesPassed: number;
  totalTestcases: number;
  testcaseResults: TestCaseResult[];
  failedResult: FailedResult;
  user: Partial<UserProfile>;
  problem: Partial<Problem>;
  compileError: string;
  runtimeError: string;
  submittedAt: string;
  problemId: number;
  languageId: number;
  language?: Language;
  sourceCode?: string;
  contestId?: number;
}

// Map language names to Highlight.js language keys
export const languageMap: Record<string, string> = {
  'C++': 'cpp',
  Python: 'python',
  Java: 'java',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  'C#': 'csharp',
  Go: 'go',
  Rust: 'rust',
};

type LanguageConfig = {
  monacoId: string;
  keywords: string[];
  exclude?: string[];
};

export const LANGUAGE_DEFINITIONS: LanguageConfig[] = [
  // --- Popular Web & Scripting ---
  {
    monacoId: 'python',
    keywords: ['python', 'py', 'pypy'],
  },
  {
    monacoId: 'javascript',
    keywords: ['javascript', 'js', 'node'],
  },
  {
    monacoId: 'typescript',
    keywords: ['typescript', 'ts'],
  },
  {
    monacoId: 'php',
    keywords: ['php'],
  },
  {
    monacoId: 'ruby',
    keywords: ['ruby'],
  },
  {
    monacoId: 'perl',
    keywords: ['perl'],
  },
  {
    monacoId: 'lua',
    keywords: ['lua'],
  },
  {
    monacoId: 'shell',
    keywords: ['bash', 'sh', 'shell'],
  },
  {
    monacoId: 'r',
    keywords: ['r ('], // Matches "R (4.0.0)"
    exclude: ['ruby', 'rust', 'perl'],
  },

  // --- C-Family & Systems ---
  {
    monacoId: 'cpp',
    keywords: ['c++', 'cpp', 'g++', 'clang'], // Matches "C++ (GCC...)"
  },
  {
    monacoId: 'c',
    keywords: ['c (', 'gcc', 'clang'], // Matches "C (GCC...)"
    // Critical: Exclude variants to prevent matching C++, C#, or Objective-C
    exclude: ['c++', 'cpp', 'c#', 'objective', 'g++'],
  },
  {
    monacoId: 'csharp',
    keywords: ['c#', 'mono', 'dotnet', '.net'],
  },
  {
    monacoId: 'objective-c',
    keywords: ['objective-c', 'objc'],
  },
  {
    monacoId: 'java',
    keywords: ['java', 'openjdk'],
    exclude: ['javascript'],
  },
  {
    monacoId: 'kotlin',
    keywords: ['kotlin'],
  },
  {
    monacoId: 'swift',
    keywords: ['swift'],
  },
  {
    monacoId: 'go',
    keywords: ['go', 'golang'],
  },
  {
    monacoId: 'rust',
    keywords: ['rust'],
  },

  // --- Functional & Enterprise ---
  {
    monacoId: 'scala',
    keywords: ['scala'],
  },
  {
    monacoId: 'clojure',
    keywords: ['clojure'],
  },
  {
    monacoId: 'fsharp',
    keywords: ['f#'],
  },
  {
    monacoId: 'sql',
    keywords: ['sql', 'sqlite'],
  },
  {
    monacoId: 'vb',
    keywords: ['visual basic', 'vb.net', 'basic (fbc'], // Covers "Basic (FBC...)" and "Visual Basic.Net"
  },
  {
    monacoId: 'pascal',
    keywords: ['pascal'],
  },

  // --- Mappings for languages not standard in Monaco (Fallbacks) ---
  // Using 'plaintext' for safety, or similar syntaxes where applicable
  {
    monacoId: 'plaintext',
    keywords: [
      'assembly',
      'executable',
      'plain text',
      'multi-file',
      'cobol',
      'fortran',
      'haskell',
      'ocaml',
      'prolog',
      'octave',
      'd (dmd',
      'erlang',
    ],
  },

  // Optional: Heuristic mappings (If you prefer partial highlighting over plain text)
  // { monacoId: 'java', keywords: ['groovy'] }, // Groovy looks like Java
  // { monacoId: 'elixir', keywords: ['elixir'] }, // Supported in newer Monaco versions
  {
    monacoId: 'plaintext',
    keywords: ['groovy', 'elixir', 'common lisp'],
  },
];
