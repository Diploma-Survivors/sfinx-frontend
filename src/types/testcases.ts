export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface SampleTestCase {
  id?: number;
  problem?: string;
  input: string;
  expectedOutput: string;
  orderIndex?: number;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestcaseRequest {
  testcases: SampleTestCase[];
}

export interface CreateTestcaseFileResponse {
  id: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestcaseResponse {
  id: string;
}
