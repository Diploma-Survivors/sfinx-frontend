import MonacoEditor from "@/components/problems/tabs/description/panels/editor-panel/monaco-editor";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { ContestsService } from "@/services/contests-service";
import { selectContest } from "@/store/slides/contest-slice";
import { selectProblem } from "@/store/slides/problem-slice";
import {
  selectWorkspace,
  setWorkspace,
  updateCurrentCode,
  updateCurrentLanguage,
} from "@/store/slides/workspace-slice";
import { CONTEST_SUBMISSION_STRATEGY_DESCRIPTION } from "@/types/contests";
import { getDefaultCode } from "@/types/languages";
import { AlertCircle, CheckCircle, Play, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

interface EditorPanelProps {
  height: number;
  isRunning: boolean;
  isSubmitting: boolean;
  contestMode?: boolean;
  onRun: (sourceCode: string, languageId: number) => void;
  onSubmit: (
    sourceCode: string,
    languageId: number,
    contestId?: number,
  ) => void;
  readOnly?: boolean;
}

export function EditorPanel({
  height,
  isRunning,
  isSubmitting,
  contestMode = false,
  onRun,
  onSubmit,
  readOnly = false,
}: EditorPanelProps) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const contestId =
    segments[1] === "contests" && segments[2]
      ? Number.parseInt(segments[2], 10)
      : undefined;

  const dispatch = useDispatch();
  const workspace = useSelector(selectWorkspace);
  const problem = useSelector(selectProblem);
  const { isLoggedin, isEmailVerified } = useApp();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("problems");

  const currentLanguageId = workspace?.currentLanguage?.[problem.id] ?? 46;
  const currentCode =
    workspace?.currentCode?.[problem.id]?.[currentLanguageId] ??
    workspace?.languages?.find((lang) => lang.id === currentLanguageId)
      ?.starterCode ??
    "Write your code here";

  const handleRunClick = () => {
    onRun(currentCode, currentLanguageId);
  };

  const handleSubmitClick = () => {
    onSubmit(currentCode, currentLanguageId, contestId);
  };

  const contest = useSelector(selectContest);

  const isInProgress = contestMode
    ? ContestsService.isInProgress(contest)
    : true;

  const onLanguageIdChange = (languageId: number) => {
    dispatch(
      updateCurrentLanguage({ problemId: problem.id.toString(), languageId }),
    );
  };

  const onCurrentCodeChange = (code: string) => {
    dispatch(
      updateCurrentCode({
        problemId: problem.id,
        languageId: currentLanguageId,
        code,
      }),
    );
  };

  return (
    <div
      className="flex flex-col overflow-y-auto rounded-xl border border-border bg-card shadow-sm"
      style={{ height: `${height}%` }}
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <MonacoEditor
            currentLanguageId={currentLanguageId}
            onCurrentLanguageIdChange={onLanguageIdChange}
            currentCode={currentCode}
            onCurrentCodeChange={onCurrentCodeChange}
            readOnly={readOnly}
          />
        </div>

        {!readOnly && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              {(!isLoggedin || !isEmailVerified) && (
                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {!isLoggedin
                      ? tCommon("login_required_action")
                      : tCommon("email_verification_required_action")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex ml-auto items-center gap-3">
              <Button
                onClick={handleRunClick}
                disabled={isRunning}
                variant="secondary"
                size="sm"
                className="h-9 px-4 text-sm font-medium"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {t("running")}
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2" />
                    {t("run")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting || !isInProgress}
                className="h-9 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
