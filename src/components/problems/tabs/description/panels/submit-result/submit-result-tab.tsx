import { getStatusMeta } from "@/lib/utils/testcase-status";
import { formatMemory, formatRuntime } from "@/lib/utils/format-submission";
import type { SSEResult } from "@/services/sse-service";
import { MemoryStick, Timer, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SubmissionStatus } from "@/types/submissions";
import { PerformanceChart } from "./performance-chart";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useApp } from "@/contexts/app-context";

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
  const { t } = useTranslation("problems");
  const { user } = useApp();
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
                {t("submit_result_title")}
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
                  {t("test_cases_passed", {
                    passed: result?.passedTests,
                    total: result?.totalTests,
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("test_cases").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {result?.passedTests ?? 0} / {result?.totalTests ?? 0}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("runtime").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {formatRuntime(result?.runtime ? Number(result.runtime) : null)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("memory").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {formatMemory(result?.memory)}
                </div>
              </div>
            </div>

            {/* Performance Chart - Only show for Accepted cases with an ID */}
            {result?.status === "ACCEPTED" && result?.id && (
              <PerformanceChart
                submissionId={result.id}
                userAvatarUrl={user?.avatarUrl}
                userRuntimeMs={result.runtime ? Number(result.runtime) : undefined}
                userMemoryKb={result.memory}
              />
            )}

            {/* Error Details - Only show for failed cases */}
            {result &&
              result.status !== SubmissionStatus.ACCEPTED &&
              result.resultDescription && (() => {
                const desc = result.resultDescription;

                if (result.status === SubmissionStatus.COMPILATION_ERROR) {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>{t("failed_description")}</span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                          {desc.compileOutput}
                        </pre>
                      </div>
                    </div>
                  );
                }

                if (result.status === SubmissionStatus.RUNTIME_ERROR) {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>{t("failed_description")}</span>
                      </div>
                      <div className="space-y-3">
                        {desc.compileOutput && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                              {t("compile_warnings", "Compile Warnings")}
                            </div>
                            <pre className="text-sm font-mono text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap overflow-x-auto">
                              {desc.compileOutput}
                            </pre>
                          </div>
                        )}
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-4">
                          {desc.stderr ? (
                            <div>
                              <div className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                                {t("error", "Error")}
                              </div>
                              <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                                {desc.stderr}
                              </pre>
                            </div>
                          ) : null}
                          {desc.stdout ? (
                            <div>
                              <div className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                                {t("stdout", "stdout")}
                              </div>
                              <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                                {desc.stdout}
                              </pre>
                            </div>
                          ) : null}
                          {!desc.stderr && !desc.stdout && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {t("no_error_details", "No error details available.")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (result.status === SubmissionStatus.WRONG_ANSWER) {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>{t("failed_description")}</span>
                      </div>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                        {desc.stdin && (
                          <div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {t("input")}
                            </div>
                            <pre className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                              {desc.stdin}
                            </pre>
                          </div>
                        )}
                        {desc.expectedOutput && (
                          <div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {t("expected_output")}
                            </div>
                            <pre className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-sm whitespace-pre-wrap">
                              {desc.expectedOutput}
                            </pre>
                          </div>
                        )}
                        {desc.stdout && (
                          <div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {t("your_output")}
                            </div>
                            <div className="bg-slate-200 dark:bg-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {desc.stdout}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>{t("failed_description")}</span>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="text-red-600 dark:text-red-400 font-medium whitespace-pre-wrap">
                        {desc.message}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitResultTab;
