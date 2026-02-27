import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useProblemDetail } from "@/contexts/problem-detail-context";

import { toastService } from "@/services/toasts-service";
import {
  type Problem,
  ProblemDifficulty,
  ProblemStatus,
  getDifficultyColor,
} from "@/types/problems";

import type { SampleTestCase } from "@/types/testcases";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Lightbulb,
  Lock,
  Tag as TagIcon,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProblemDiscussion } from "./problem-discussion";
import { ProblemHints } from "./problem-hints";
import { ProblemTopicsTags } from "./problem-topics-tags";
import { ReportProblemModal } from "./report-problem-modal";

interface DescriptionPanelProps {
  problem: Problem;
  width: number;
}

export function DescriptionPanel({ problem, width }: DescriptionPanelProps) {
  const { t } = useTranslation(["problems", "profile"]);
  const { similarProblems } = useProblemDetail();
  const sampleCases: SampleTestCase[] = problem.sampleTestcases || [];
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [isSimilarOpen, setIsSimilarOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const hintsRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);

  // Choose sample case
  const activeSample = sampleCases[activeSampleIndex];

  // helper function to copy to clipboard
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toastService.success(t("copied_to_clipboard"));
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-full pb-4" style={{ width: `${width}%` }}>
      <div className="h-full flex flex-col overflow-hidden border border-border bg-card">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Problem Title Header */}
          <div className="pb-6 border-b border-border space-y-4">
            {/* Row 1: Title & Solved Status */}
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl font-bold text-foreground">
                {problem.title}
              </h1>
              {problem.status === ProblemStatus.SOLVED && (
                <div className="flex items-center gap-2 text-green-600 font-medium whitespace-nowrap">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t("status_solved")}</span>
                </div>
              )}
            </div>

            {/* Row 2: Meta & Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  problem.difficulty === "easy"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : problem.difficulty === "medium"
                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                }`}
              >
                {t(`difficulty_${problem.difficulty}`)}
              </div>

              {problem.isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t("premium", { ns: "profile" })}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-2"
                onClick={() => scrollToSection(hintsRef)}
              >
                <Lightbulb className="w-4 h-4" />
                {t("hint")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-2"
                onClick={() => scrollToSection(topicsRef)}
              >
                <TagIcon className="w-4 h-4" />
                {t("topics_tags_title")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-2 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => setIsReportOpen(true)}
              >
                <TriangleAlert className="w-4 h-4" />
                {t("report")}
              </Button>
            </div>
          </div>

          {/* Problem Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("description_title")}
            </h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              <MarkdownRenderer content={problem.description || ""} />
            </div>
          </section>

          {/* Sample Cases - compact view */}
          {sampleCases.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("examples_title")}
              </h2>

              {/* Case selector tabs */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                {sampleCases.map((sample, index) => (
                  <button
                    key={`sample-tab-${sample.id ?? sample.input?.slice(0, 20) ?? index}`}
                    onClick={() => setActiveSampleIndex(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeSampleIndex === index
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t("case")} {index + 1}
                  </button>
                ))}
              </div>

              {/* Active sample content */}
              {activeSample && (
                <div className="space-y-4">
                  {/* Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {t("input")}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => copyToClipboard(activeSample.input)}
                      >
                        <Copy className="w-3 h-3 mr-1" /> {t("copy")}
                      </Button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <pre className="text-foreground font-mono text-sm whitespace-pre-wrap">
                        {activeSample.input || ""}
                      </pre>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {t("output")}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          copyToClipboard(activeSample.expectedOutput)
                        }
                      >
                        <Copy className="w-3 h-3 mr-1" /> {t("copy")}
                      </Button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <pre className="text-foreground font-mono text-sm whitespace-pre-wrap">
                        {activeSample.expectedOutput || ""}
                      </pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  {activeSample.explanation && (
                    <div className="text-sm text-muted-foreground italic">
                      <span className="font-semibold not-italic mr-1">
                        {t("explanation")}:
                      </span>
                      {activeSample.explanation}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Constraints */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("constraints_title")}
            </h3>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              <MarkdownRenderer content={problem.constraints || ""} />
            </div>
          </section>

          {/* Hints Section */}
          {problem.hints && problem.hints.length > 0 && (
            <section ref={hintsRef} className="scroll-mt-4">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                {t("hint")}
              </h3>
              <ProblemHints hints={problem.hints} />
            </section>
          )}

          {/* Topics & Tags */}
          <div ref={topicsRef} className="scroll-mt-4">
            <ProblemTopicsTags topics={problem.topics} tags={problem.tags} />
          </div>

          {/* Similar Problems */}
          {similarProblems.length > 0 && (
            <Collapsible
              open={isSimilarOpen}
              onOpenChange={setIsSimilarOpen}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">
                  {t("similar_problems")}
                </h3>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isSimilarOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                {similarProblems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/problems/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {p.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize border ${getDifficultyColor(
                          p.difficulty,
                        )}`}
                      >
                        {t(`difficulty_${p.difficulty}`)}
                      </span>
                      {p.status === ProblemStatus.SOLVED && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Discussion */}
          <ProblemDiscussion problemId={problem.id.toString()} />
        </div>
      </div>

      <ReportProblemModal
        isOpen={isReportOpen}
        onOpenChange={setIsReportOpen}
        problemId={problem.id}
      />
    </div>
  );
}
