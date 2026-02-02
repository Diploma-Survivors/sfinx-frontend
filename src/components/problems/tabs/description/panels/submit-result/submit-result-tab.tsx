import { getStatusMeta } from '@/lib/utils/testcase-status';
import type { SSEResult } from '@/services/sse-service';
import { MemoryStick, Timer, X, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SubmitResultTabProps {
  width: number;
  result: SSEResult | null;
  isSubmitting: boolean;
  onClose: () => void;
}

export function SubmitResultTab({
  width,
  result,
  isSubmitting,
  onClose,
}: SubmitResultTabProps) {
  const { t } = useTranslation('problems');
  const statusInfo = result ? getStatusMeta(result.status) : null;

  if (isSubmitting) {
    return (
      <div
        className="overflow-y-auto h-full pb-4"
        style={{ width: `${width}%` }}
      >
        <div className="">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="p-8 space-y-7">
              {/* Header (Skeleton while submitting) */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton height={28} width={200} />
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Loading State with Skeleton */}
              <div className="space-y-6">
                {/* Verdict Skeleton */}
                <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton circle height={24} width={24} />
                    <Skeleton height={24} width={120} />
                  </div>
                  <Skeleton height={16} width={180} />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <Skeleton height={12} width={60} className="mb-2" />
                    <Skeleton height={24} width={80} />
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <Skeleton height={12} width={60} className="mb-2" />
                    <Skeleton height={24} width={80} />
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                    <Skeleton height={12} width={60} className="mb-2" />
                    <Skeleton height={24} width={80} />
                  </div>
                </div>

                {/* Failed Details Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton circle height={20} width={20} />
                    <Skeleton height={18} width={180} />
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                    {/* Message */}
                    <Skeleton height={16} width={260} />

                    {/* Input block */}
                    <div>
                      <Skeleton height={14} width={60} className="mb-2" />
                      <Skeleton height={80} />
                    </div>

                    {/* Expected Output block */}
                    <div>
                      <Skeleton height={14} width={120} className="mb-2" />
                      <Skeleton height={80} />
                    </div>

                    {/* Your Output block */}
                    <div>
                      <Skeleton height={14} width={90} className="mb-2" />
                      <Skeleton height={80} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto h-full pb-4" style={{ width: `${width}%` }}>
      <div className="">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="p-8 space-y-7">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {t('submit_result_title')}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verdict */}
            {statusInfo && (
              <div className={`p-5 rounded-lg border ${statusInfo.color}`}>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 mt-2">
                  {t('test_cases_passed', {
                    passed: result?.passedTests,
                    total: result?.totalTests,
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">SCORE</div>
                <div className="text-xl font-semibold">
                  {result?.score ?? 0} / 100
                </div>
              </div> */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t('runtime').toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {result?.runtime ? Number(result.runtime).toFixed(2) : '0.00'}{' '}
                  ms
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t('memory').toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {result?.memory ?? 0} KB
                </div>
              </div>
            </div>

            {/* Failed Test Case Details - Only show for failed cases */}
            {result?.resultDescription && result.status !== 'ACCEPTED' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>{t('failed_description')}</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-red-600 dark:text-red-400 font-medium">
                      {result.resultDescription.message}
                    </div>
                  </div>

                  {result.resultDescription.stdin && (
                    <div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('input')}
                      </div>
                      <pre className="bg-slate-50 dark:bg-slate-900 rounded p-3 text-sm whitespace-pre-wrap">
                        {result.resultDescription.stdin}
                      </pre>
                    </div>
                  )}

                  {result.resultDescription.expectedOutput && (
                    <div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('expected_output')}
                      </div>
                      <pre className="bg-green-50 dark:bg-green-900 rounded p-3 text-sm whitespace-pre-wrap">
                        {result.resultDescription.expectedOutput}
                      </pre>
                    </div>
                  )}

                  {result.resultDescription.stdout && (
                    <div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('your_output')}
                      </div>
                      <pre className="bg-red-50 dark:bg-red-900 rounded p-3 text-sm whitespace-pre-wrap">
                        {result.resultDescription.stdout}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitResultTab;
