import type { SampleTestCase } from "@/types/testcases";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface TestcaseTabProps {
  testCases: SampleTestCase[];
  activeTestCase: number;
  onTestCaseChange: (
    id: number,
    field: "input" | "expectedOutput",
    value: string,
  ) => void;
  readOnly?: boolean;
}

export function TestcaseTab({
  testCases,
  activeTestCase,
  onTestCaseChange,
  readOnly = false,
}: TestcaseTabProps) {
  const { t } = useTranslation("problems");
  const currentCase = testCases[activeTestCase];

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Resize textareas when switching tabs or loading data
  useEffect(() => {
    if (!currentCase?.id) return;

    const inputEl = document.getElementById(
      `tc-input-${currentCase.id}`,
    ) as HTMLTextAreaElement | null;
    const outputEl = document.getElementById(
      `tc-output-${currentCase.id}`,
    ) as HTMLTextAreaElement | null;

    autoResize(inputEl);
    autoResize(outputEl);
  }, [currentCase?.id, autoResize]);

  if (!currentCase) return null;

  // Validation Flags
  const isInputEmpty = !currentCase.input;
  const isOutputEmpty = !currentCase.expectedOutput;

  // Helper to get classes based on error state
  const getTextAreaClasses = (hasError: boolean) => {
    const baseClasses =
      "w-full min-h-10 p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden resize-none focus:outline-none focus:ring-2 text-slate-800 dark:text-slate-200 transition-colors";

    const statusClasses = hasError
      ? "border border-red-500 focus:ring-red-500"
      : "border border-slate-200 dark:border-slate-700 focus:ring-blue-500";

    return `${baseClasses} ${statusClasses}`;
  };

  return (
    <>
      {/* INPUT SECTION */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t("input")}
          </h4>
        </div>
        <div className="flex flex-col w-full">
          <textarea
            id={`tc-input-${currentCase.id}`}
            rows={1}
            value={currentCase.input}
            onInput={(e) => autoResize(e.currentTarget)}
            onChange={(e) =>
              onTestCaseChange(currentCase.id ?? 0, "input", e.target.value)
            }
            placeholder={t("enter_input")}
            readOnly={readOnly}
            className={getTextAreaClasses(isInputEmpty)}
          />
          {isInputEmpty && !readOnly && (
            <span className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
              {t("input_empty_error")}
            </span>
          )}
        </div>
      </div>

      {/* OUTPUT SECTION */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {t("expected_output")}
        </h4>
        <div className="flex flex-col w-full">
          <textarea
            id={`tc-output-${currentCase.id}`}
            rows={1}
            value={currentCase.expectedOutput}
            onInput={(e) => autoResize(e.currentTarget)}
            onChange={(e) =>
              onTestCaseChange(
                currentCase.id ?? 0,
                "expectedOutput",
                e.target.value,
              )
            }
            placeholder={t("enter_output")}
            readOnly={readOnly}
            className={getTextAreaClasses(isOutputEmpty)}
          />
          {isOutputEmpty && !readOnly && (
            <span className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
              {t("output_empty_error")}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default TestcaseTab;
