import { formatMemory, formatRuntime } from '@/lib/utils/format-submission';
import { getStatusMeta } from '@/lib/utils/testcase-status';
import type { SSEResult } from '@/services/sse-service';
import { SubmissionStatus } from '@/types/submissions';
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
  const renderContent = () => {
    if (!testResult) {
      return (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('input')}
              </h4>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {testCases[activeTestCase].input || t('no_input')}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('expected_output')}
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <pre className="text-slate-800 dark:text-slate-200 font-mono text-sm whitespace-pre-wrap">
                {testCases[activeTestCase].expectedOutput ||
                  t('no_expected_output')}
              </pre>
            </div>
          </div>
        </>
      );
    }

    if (testResult.status === SubmissionStatus.COMPILATION_ERROR) {
      return (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {t('compile_output', 'Compile Output')}
          </h4>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
              {testResult.compileOutput}
            </pre>
          </div>
        </div>
      );
    }

    if (testResult.status === SubmissionStatus.RUNTIME_ERROR) {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('runtime_error', 'Runtime Error')}
          </h4>

          {testResult.compileOutput && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                {t('compile_warnings', 'Compile Warnings')}
              </div>
              <pre className="text-sm font-mono text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap overflow-x-auto">
                {testResult.compileOutput}
              </pre>
            </div>
          )}

          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-4">
            {(testResult.stderr || testResult.stdout) ? (
              <div>
                <div className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                  {t('error', 'Error')}
                </div>
                <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                  {testResult.stderr || testResult.stdout}
                </pre>
              </div>
            ) : (
              <div className="text-sm text-red-600 dark:text-red-400">
                {t('no_error_details', 'No error details available.')}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('input')}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {testCases[activeTestCase].input || t('no_input')}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {t('expected_output')}
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <pre className="text-slate-800 dark:text-slate-200 font-mono text-sm whitespace-pre-wrap">
              {testResult.expectedOutput ??
                (testCases[activeTestCase].expectedOutput ||
                  t('no_expected_output'))}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {t('your_output')}
          </h4>
          <div className="bg-slate-200 dark:bg-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap">
              {testResult.stdout || t('no_output')}
            </pre>
            {testResult.stderr && (
              <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap mt-2">
                {testResult.stderr}
              </pre>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
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
                  {t('runtime')}:{' '}
                  {formatRuntime(
                    testResult.time ? Number(testResult.time) : null
                  )}
                </span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  {t('memory')}: {formatMemory(testResult.memory)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

export default ResultTab;
