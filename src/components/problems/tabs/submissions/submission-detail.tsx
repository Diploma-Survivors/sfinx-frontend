"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { getStatusMeta } from "@/lib/utils/testcase-status";
import { toastService } from "@/services/toasts-service";
import { toggleVisibility } from "@/store/slides/ai-review-slice";
import { selectProblem } from "@/store/slides/problem-slice";
import type { Submission } from "@/types/submissions";
import { SubmissionStatus, languageMap } from "@/types/submissions";
import { Copy, Loader2, PenSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface SubmissionDetailProps {
  submission: Submission;
}

const formatRuntime = (runtime: number) => {
  if (runtime === 0) return "0ms";
  return `${(runtime * 1000).toFixed(0)} ms`;
};

const formatMemory = (memory: number) => {
  if (memory === 0) return "0 KB";
  return `${(memory / 1024).toFixed(0)} KB`;
};

export default function SubmissionDetail({
  submission,
}: SubmissionDetailProps) {
  const dispatch = useDispatch();
  const params = useParams();
  const problemId = params.id as string;
  const { t } = useTranslation("problems");
  const [isCodeExpanded, setIsCodeExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

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

    // Always expanded height
    const totalHeight = Math.max(lines * lineHeight + padding, 200);
    return { height: `${totalHeight}px` };
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.sourceCode || "");
    toastService.success(t("source_code_copied"));
  };

  const getSyntaxLanguage = (languageName: string) => {
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(toggleVisibility())}
                className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-900 dark:hover:bg-yellow-900/20"
              >
                <Sparkles className="w-4 h-4" />
                {t("ai_review_button")}
              </Button>
            </div>

            {/* Status */}
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

                  {submission.status === SubmissionStatus.WRONG_ANSWER &&
                    submission.failedResult && (
                      <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                            {t("input_title")}
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md font-mono text-sm overflow-x-auto">
                            {submission.failedResult.input}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                              {t("expected_output")}
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 p-3 rounded-md font-mono text-sm overflow-x-auto text-green-800 dark:text-green-300">
                              {submission.failedResult.expectedOutput}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                              {t("your_output")}
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-3 rounded-md font-mono text-sm overflow-x-auto text-red-800 dark:text-red-300">
                              {submission.failedResult.actualOutput}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
            })()}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500 uppercase">
                  {t("runtime")}
                </div>
                <div className="text-xl font-semibold">
                  {formatRuntime(submission.executionTime)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="text-xs text-slate-500 uppercase">
                  {t("memory")}
                </div>
                <div className="text-xl font-semibold">
                  {formatMemory(submission.memoryUsed)}
                </div>
              </div>
            </div>

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
                      language={getSyntaxLanguage("plaintext")} // Language name not directly available in new Submission type, defaulting or need to fetch
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
