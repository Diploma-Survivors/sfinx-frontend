"use client";

import { useProblemDescription } from "@/hooks/use-problem-description";
import { ProblemsService } from "@/services/problems-service";
import { type SSEResult, sseService } from "@/services/sse-service";
import { SubmissionsService } from "@/services/submissions-service";
import { setProblem } from "@/store/slides/problem-slice";
import type { Problem } from "@/types/problems";
import type { Language } from "@/types/submissions";
import type { SampleTestCase } from "@/types/testcases";
import { useParams } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";

interface ProblemDetailContextType {
  problem: Problem | null;
  isLoading: boolean;
  languages: Language[];
  similarProblems: Problem[];

  // From useProblemDescription
  containerRef: React.RefObject<HTMLDivElement | null>;
  rightPanelRef: React.RefObject<HTMLDivElement | null>;
  leftWidth: number;
  editorHeight: number;
  isHorizontalDragging: boolean;
  isVerticalDragging: boolean;
  handleHorizontalMouseDown: (e: React.MouseEvent) => void;
  handleVerticalMouseDown: (e: React.MouseEvent) => void;

  testCases: SampleTestCase[];
  activeTestCase: number;
  setActiveTestCase: (index: number) => void;
  handleTestCaseChange: (
    id: number,
    field: "input" | "expectedOutput",
    value: string,
  ) => void;
  handleTestCaseAdd: () => void;
  handleTestCaseDelete: (id: number) => void;

  isRunning: boolean;
  isSubmitting: boolean;
  testResults: SSEResult | null;
  submitResults: SSEResult | null;
  runError: string | null;
  refreshKey: number;
  handleRun: (sourceCode: string, languageId: number) => Promise<void>;
  handleSubmit: (
    sourceCode: string,
    languageId: number,
    contestId?: number,
  ) => Promise<void>;
  clearSubmitResults: () => void;
}

export const ProblemDetailContext = createContext<
  ProblemDetailContextType | undefined
>(undefined);

export function ProblemDetailProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const problemIdString = params.id as string;
  const problemId = Number(problemIdString);
  const dispatch = useDispatch();

  const [problem, setProblemState] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [similarProblems, setSimilarProblems] = useState<Problem[]>([]);

  // 1. Fetch Problem and Languages
  useEffect(() => {
    if (!problemId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemData, langResponse] = await Promise.all([
          ProblemsService.getProblemById(problemId),
          SubmissionsService.getLanguageList(),
        ]);

        setProblemState(problemData.data.data);
        dispatch(setProblem(problemData.data.data)); // Keep redux sync for now
        setLanguages(langResponse);

        // Fetch similar problems if any
        if (
          problemData.data.data.similarProblems &&
          problemData.data.data.similarProblems.length > 0
        ) {
          const similarResponse = await ProblemsService.getProblemList({
            filters: { ids: problemData.data.data.similarProblems },
          });
          setSimilarProblems(similarResponse.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching problem details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [problemId, dispatch]);

  // 2. Initialize Logic Hook (only when problem is loaded)
  // We need a dummy problem object if it's null to call the hook unconditionally.
  // The hook expects a ProblemDescription (which Problem satisfies).
  const problemDescriptionState = useProblemDescription({
    problem: problem || ({ id: problemId } as any),
  });

  if (isLoading || !problem) {
    return (
      <ProblemDetailContext.Provider
        value={{
          isLoading: true,
          languages: [],
          similarProblems: [],
          ...problemDescriptionState, // This contains the dummy problem state
          problem: null, // Override with null for consumers
          testCases:
            problemDescriptionState.testCases as unknown as SampleTestCase[],
          testResults: problemDescriptionState.testResults,
          submitResults: problemDescriptionState.submitResults,
          runError: problemDescriptionState.runError,
        }}
      >
        {children}
      </ProblemDetailContext.Provider>
    );
  }

  return (
    <ProblemDetailContext.Provider
      value={{
        isLoading: false,
        languages,
        similarProblems,
        ...problemDescriptionState,
        problem,
        testCases:
          problemDescriptionState.testCases as unknown as SampleTestCase[],
      }}
    >
      {children}
    </ProblemDetailContext.Provider>
  );
}

export function useProblemDetail() {
  const context = useContext(ProblemDetailContext);
  if (context === undefined) {
    throw new Error(
      "useProblemDetail must be used within a ProblemDetailProvider",
    );
  }
  return context;
}
