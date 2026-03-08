"use client";

import AIReviewModal from "@/components/problems/tabs/submissions/ai-review-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatMemory, formatRuntime } from "@/lib/utils/format-submission";
import { getStatusMeta } from "@/lib/utils/testcase-status";
import { toastService } from "@/services/toasts-service";
import { selectProblem } from "@/store/slides/problem-slice";
import type { Submission } from "@/types/submissions";
import { SubmissionStatus, languageMap } from "@/types/submissions";
import { PerformanceChart } from "@/components/problems/tabs/description/panels/submit-result/performance-chart";
import { Copy, Loader2, PenSquare, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useApp } from "@/contexts/app-context";

interface SubmissionDetailProps {
  submission: Submission;
}


export default function SubmissionDetail({
  submission,
}: SubmissionDetailProps) {
  const params = useParams();
  const problemId = params.id as string;
  const { t } = useTranslation("problems");
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const { user } = useApp();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timeoutId: any;
    const onScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolling(false), 700);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const currentProblem = useSelector(selectProblem);

  // Calculate code height based on number of lines
  const getCodeHeight = () => {
    if (!submission) return { height: "192px" }; // h-48 equivalent

    const lines = (submission.sourceCode || "").split("\n").length;
    const lineHeight = 22; // Match SyntaxHighlighter line-height
    const padding = 40; // Matches customStyle padding top+bottom (20px * 2)

    const totalHeight = Math.max(lines * lineHeight + padding, 200);

    // Collapse if height exceeds 300px and not expanded
    if (!isCodeExpanded && totalHeight > 300) {
      return { height: "300px" };
    }

    return { height: `${totalHeight}px` };
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.sourceCode || "");
    toastService.success(t("source_code_copied"));
  };

  const getSyntaxLanguage = (languageName?: string) => {
    if (!languageName) return "plaintext";
    // Find matching language key
    for (const [key, value] of Object.entries(languageMap)) {
      if (languageName.includes(key)) {
        return value;
      }
    }

    return "plaintext";
  };

  if (!submission) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500 dark:text-slate-400 space-y-2">
          <div className="text-lg font-semibold">
            {t("no_submission_selected")}
          </div>
          <div>{t("select_submission_prompt")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-full">
        <div
          ref={scrollRef}
          className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-full overflow-y-auto scrollbar-on-scroll ${isScrolling ? "scrolling" : ""}`}
        >
          <div className="p-8 pt-3 space-y-7">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {t("submission_header", { id: submission.id })}
                </h2>
                {submission.status.toLowerCase() ===
                  SubmissionStatus.ACCEPTED.toLowerCase() && (
                      <Link
                        href={`/problems/${problemId}/solutions/create/${submission.id}`}
                        target="_blank"
                      >
                        <Tooltip content={t("share_solution_tooltip")}>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            size="sm"
                          >
                            <PenSquare className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </Link>
                  )}
              </div>
              {submission.status.toLowerCase() ===
                  SubmissionStatus.ACCEPTED.toLowerCase() &&(
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIReviewModalOpen(true)}
                className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-900 dark:hover:bg-yellow-900/20"
              >
                <Sparkles className="w-4 h-4" />
                {t("ai_review_button")}
              </Button>
            )}
            </div>

            {/* Verdict */}
            {(() => {
              const statusInfo = getStatusMeta(submission.status);
              return (
                <div className={`p-5 rounded-lg border ${statusInfo.color}`}>
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <span className={statusInfo.iconColor}>
                      {statusInfo.icon}
                    </span>
                    <span>{statusInfo.label}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-2">
                    {t("test_cases_passed", {
                      passed: submission.testcasesPassed,
                      total: submission.totalTestcases,
                    })}
                  </div>

                </div>
              );
            })()}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("test_cases").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {submission.testcasesPassed ?? 0} / {submission.totalTestcases ?? 0}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("runtime").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {formatRuntime(submission.executionTime)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500">
                  {t("memory").toUpperCase()}
                </div>
                <div className="text-xl font-semibold">
                  {formatMemory(submission.memoryUsed)}
                </div>
              </div>
            </div>

            {/* Performance Distribution Chart - Only for accepted submissions */}
            {submission.status === SubmissionStatus.ACCEPTED && (
              <PerformanceChart
                submissionId={submission.id}
                userAvatarUrl={user?.avatarUrl}
                userRuntimeMs={submission.executionTime}
                userMemoryKb={submission.memoryUsed}
              />
            )}

            {/* Failed Test Case Details - Only show for failed cases */}
            {(submission.failedResult || submission.resultDescription) && submission.status !== SubmissionStatus.ACCEPTED && (() => {
              const desc = submission.failedResult || submission.resultDescription;
              if (!desc) return null;

              if (submission.status === SubmissionStatus.COMPILATION_ERROR) {
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

              if (submission.status === SubmissionStatus.RUNTIME_ERROR) {
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
                        {(desc.stdout || desc.actualOutput) ? (
                          <div>
                            <div className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">
                              {t("stdout", "stdout")}
                            </div>
                            <pre className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
                              {desc.stdout || desc.actualOutput}
                            </pre>
                          </div>
                        ) : null}
                        {!desc.stderr && !desc.stdout && !desc.actualOutput && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            {t("no_error_details", "No error details available.")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              if (submission.status === SubmissionStatus.WRONG_ANSWER) {
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>{t("failed_description")}</span>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                      {(desc.input || desc.stdin) && (
                        <div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t("input")}
                          </div>
                          <pre className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto">
                            {desc.input || desc.stdin}
                          </pre>
                        </div>
                      )}
                      {desc.expectedOutput && (
                        <div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t("expected_output")}
                          </div>
                          <pre className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                            {desc.expectedOutput}
                          </pre>
                        </div>
                      )}
                      {(desc.stdout || desc.actualOutput) && (
                        <div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {t("your_output")}
                          </div>
                          <div className="bg-slate-200 dark:bg-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <pre className="text-black dark:text-black font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                              {desc.stdout || desc.actualOutput}
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

            {/* Source Code */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                <span>{t("source_code")}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {t("copy")}
                </Button>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900">
                <div className="relative">
                  <div
                    className="transition-all duration-300 ease-in-out relative overflow-hidden"
                    style={getCodeHeight()}
                  >
                    <SyntaxHighlighter
                      language={getSyntaxLanguage(submission.language?.name || "plaintext")}
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        borderRadius: "0",
                        fontSize: "14px",
                        lineHeight: "22px",
                        fontFamily:
                          "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace",
                        letterSpacing: "0.3px",
                        background: "#f5f5f5",
                        color: "#24292e",
                        padding: "20px",
                        overflow: isCodeExpanded ? "auto" : "hidden",
                      }}
                      showLineNumbers={true}
                      lineNumberStyle={{
                        color: "#6a737d",
                        marginRight: "16px",
                        userSelect: "none",
                        fontSize: "12px",
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {submission.sourceCode || ""}
                    </SyntaxHighlighter>
                  </div>
                  {!isCodeExpanded && submission.sourceCode && (submission.sourceCode.split("\n").length * 22 + 40 > 300) && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-slate-900 to-transparent pointer-events-none" />
                  )}
                </div>
                {submission.sourceCode && (submission.sourceCode.split("\n").length * 22 + 40 > 300) && (
                  <div className="flex justify-center p-2 border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {isCodeExpanded ? t("show_less") : t("show_more")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div >

      <AIReviewModal
        submissionId={submission.id.toString()}
        isOpen={isAIReviewModalOpen}
        onClose={() => setIsAIReviewModalOpen(false)}
        persistedReview={submission.aiReview}
      />
    </div >
  );
}
