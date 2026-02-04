import { getStatusMeta } from '@/lib/utils/testcase-status';
import type { SSEResult } from '@/services/sse-service';
import type { SampleTestCase } from '@/types/testcases';
import { useTranslation } from 'react-i18next';

interface ResultTabProps {
  testCases: SampleTestCase[];
  activeTestCase: number;
  testResults?: SSEResult | null;
  isRunning?: boolean;
  runError?: string | null;
}

export function ResultTab({
  testCases,
  activeTestCase,
  testResults,
  isRunning = false,
  runError = null,
}: ResultTabProps) {
  const hasResults = (testResults?.testResults?.length ?? 0) > 0;
  const { t } = useTranslation('problems');
  if (!testCases[activeTestCase]) return null;

  if (!hasResults) {
    return (
      <div
        className={`w-full py-20 text-center font-semibold flex items-center justify-center gap-3 ${runError ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
      >
        {isRunning && (
          <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin" />
        )}
        <span>
          {isRunning
            ? t('running_sample_testcases')
            : runError || t('must_run_to_see_results')}
        </span>
      </div>
    );
  }

  const getTestResult = (
    testResults: SSEResult | null | undefined,
    index: number
  ) => {
    if (
      !testResults ||
      !testResults.testResults ||
      index >= testResults.testResults.length
    ) {
      return null;
    }
    return testResults.testResults[index];
  };

  const testResult = getTestResult(testResults, activeTestCase);
  const statusInfo = testResult ? getStatusMeta(testResult.status) : null;

  return (
    <>
      {statusInfo && (
        <div className={`p-4 rounded-lg border ${statusInfo.color}`}>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
            {testResult && (
              <>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  Runtime: {testResult.time} ms
                </span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  Memory: {testResult.memory} KB
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Input
          </h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {testCases[activeTestCase].input || '(no input)'}
          </pre>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Expected Output
        </h4>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <pre className="text-slate-800 dark:text-slate-200 font-mono text-sm whitespace-pre-wrap">
            {testResult?.expectedOutput ??
              (testCases[activeTestCase].expectedOutput ||
                'No expected output')}
          </pre>
        </div>
      </div>

      {testResult && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Your Output
          </h4>
          <div className="bg-slate-200 dark:bg-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap">
              {testResult.stdout || '(no output)'}
            </pre>
            {testResult.stderr && (
              <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap mt-2">
                {testResult.stderr}
              </pre>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ResultTab;
