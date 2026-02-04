import type { RootState } from '@/store';
import {
  updateCurrentSampleTestCases,
  updateSingleTestCase,
} from '@/store/slides/workspace-slice';
import type { Problem } from '@/types/problems';
import type { SampleTestCase } from '@/types/testcases';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export function useTestCases(problem: Problem) {
  const dispatch = useDispatch();
  const [activeTestCase, setActiveTestCase] = useState(0);
  const savedTestCases = useSelector(
    (state: RootState) => state.workspace.currentSampleTestCases[problem.id]
  );

  // Map saved/sample test cases to the UI format
  const testCases: SampleTestCase[] = (
    savedTestCases ??
    problem.sampleTestcases ??
    []
  ).map((tc) => ({
    id: tc.id,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }));

  useEffect(() => {
    if (!savedTestCases && problem.sampleTestcases) {
      dispatch(
        updateCurrentSampleTestCases({
          problemId: problem.id,
          testCases: problem.sampleTestcases,
        })
      );
    }
  }, [dispatch, problem.id, problem.sampleTestcases, savedTestCases]);

  const handleTestCaseChange = useCallback(
    (id: number, field: 'input' | 'expectedOutput', value: string) => {
      dispatch(
        updateSingleTestCase({
          problemId: problem.id,
          index: activeTestCase,
          field: field === 'expectedOutput' ? 'expectedOutput' : field, // Map back to store format if needed
          value,
        })
      );
    },
    [dispatch, problem.id, activeTestCase]
  );

  const handleTestCaseAdd = useCallback(() => {
    const lastTestCase =
      testCases.length > 0 ? testCases[testCases.length - 1] : null;

    const newTestCase = {
      id: Date.now(),
      input: lastTestCase?.input ?? 'sample text',
      expectedOutput: lastTestCase?.expectedOutput ?? 'sample text',
    };

    // We need to construct the full array for the store
    // We can't just append to the derived `testCases` because it's a transformation
    // But we can use the current `testCases` as a base and map back
    const currentStoreTestCases = testCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    const newSampleTestcases = [...currentStoreTestCases, newTestCase];

    dispatch(
      updateCurrentSampleTestCases({
        problemId: problem.id,
        testCases: newSampleTestcases as any, // Type assertion might be needed depending on store types
      })
    );

    setActiveTestCase(newSampleTestcases.length - 1);
  }, [dispatch, problem.id, testCases]);

  const handleTestCaseDelete = useCallback(
    (id: number) => {
      const newSampleTestcases = testCases
        .filter((testCase) => testCase.id !== id)
        .map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }));

      dispatch(
        updateCurrentSampleTestCases({
          problemId: problem.id,
          testCases: newSampleTestcases as any,
        })
      );
      if (activeTestCase >= testCases.length - 1) {
        setActiveTestCase(Math.max(0, testCases.length - 2));
      }
    },
    [activeTestCase, testCases, dispatch, problem.id]
  );

  return {
    testCases,
    activeTestCase,
    setActiveTestCase,
    handleTestCaseChange,
    handleTestCaseAdd,
    handleTestCaseDelete,
  };
}
