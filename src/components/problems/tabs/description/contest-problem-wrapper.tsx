'use client';

import { useProblemDescription } from '@/hooks/use-problem-description';
import React, { useState } from 'react';
import { ResizableDivider } from './dividers/resizable-divider';
import { DescriptionPanel } from './panels/description-panel/description-panel';
import { EditorPanel } from './panels/editor-panel/editor-panel';
import { SampleTestCasesPanel } from './panels/sample-testcases-panel/sample-testcases-panel';
import SubmitResultTab from './panels/submit-result/submit-result-tab';
import SubmissionsPage from '@/components/problems/tabs/submissions/submissions-page';
import { ContestNavTabs } from '@/types/contests';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Problem } from '@/types/problems';
import { Contest } from '@/types/contests';

interface ContestProblemWrapperProps {
  contest: Contest;
  problem: Problem;
  showSubmissions?: boolean;
  contestMode?: boolean;
  onSubmitSuccess?: () => void;
}

import ContestSubmissionDetail from '@/components/contest/solve/contest-submission-detail';

export default function ContestProblemWrapper({
  contest,
  problem,
  showSubmissions = false,
  contestMode = false,
  onSubmitSuccess,
}: ContestProblemWrapperProps) {
  const { t } = useTranslation('contests');
  const [activeTab, setActiveTab] = useState<ContestNavTabs>(
    ContestNavTabs.DESCRIPTION
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);

  const {
    containerRef,
    rightPanelRef,

    // Layout state
    leftWidth,
    editorHeight,
    isHorizontalDragging,
    isVerticalDragging,

    // Test cases state
    testCases,
    activeTestCase,
    setActiveTestCase,

    // Code execution state
    isRunning,
    isSubmitting,
    testResults,
    submitResults,
    runError,

    // Event handlers
    handleHorizontalMouseDown,
    handleVerticalMouseDown,
    handleRun,
    handleSubmit,
    handleTestCaseChange,
    handleTestCaseAdd,
    handleTestCaseDelete,
    clearSubmitResults,
  } = useProblemDescription({
    problem,
  });

  const handleSubmitClick = async (
    sourceCode: string,
    languageId: number,
    contestId?: number
  ) => {
    await handleSubmit(sourceCode, languageId, contestId);
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const tabs = [
    { id: ContestNavTabs.DESCRIPTION, label: t('description'), icon: FileText },
    {
      id: ContestNavTabs.SUBMISSIONS,
      label: t('submissions'),
      icon: CheckCircle,
    },
  ];

  return (
    <div className="h-full">
      <div
        ref={containerRef}
        className="flex h-full gap-0 relative bg-slate-50 dark:bg-slate-900"
        style={{
          height: contestMode ? '100%' : 'calc(100vh - 65px)',
        }}
      >
        {/* Left Panel Container */}
        <div
          className="flex flex-col h-full"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Tabs Header */}
          <div className="flex items-center h-12 px-2 border-b border-border bg-background/50 backdrop-blur-sm shrink-0 gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-8 text-xs font-medium gap-2 px-3',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-hidden relative">
            {isSubmitting || submitResults ? (
              <SubmitResultTab
                width={100}
                result={submitResults}
                isSubmitting={isSubmitting}
                onClose={clearSubmitResults}
              />
            ) : (
              <>
                {activeTab === ContestNavTabs.DESCRIPTION && (
                  <div className="h-full">
                    <DescriptionPanel problem={problem} width={100} />
                  </div>
                )}
                {activeTab === ContestNavTabs.SUBMISSIONS && (
                  <div className="h-full pb-4">
                    <div className="h-full bg-card rounded-xl border border-border overflow-hidden">
                      {selectedSubmissionId ? (
                        <ContestSubmissionDetail
                          submissionId={selectedSubmissionId}
                          onBack={() => setSelectedSubmissionId(null)}
                        />
                      ) : (
                        <SubmissionsPage
                          problemId={problem.id}
                          contestId={contest.id}
                          onSubmissionSelect={(submission) =>
                            setSelectedSubmissionId(submission.id)
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Horizontal Resizer */}
        <ResizableDivider
          direction="horizontal"
          isDragging={isHorizontalDragging}
          onMouseDown={handleHorizontalMouseDown}
        />

        {/* Right Panel - Editor and Test Cases */}
        <div
          ref={rightPanelRef}
          className="flex flex-col overflow-hidden pb-4"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="flex flex-col h-full gap-0">
            {/* Editor Section */}
            <EditorPanel
              contestMode={contestMode}
              height={editorHeight}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              onRun={handleRun}
              onSubmit={handleSubmitClick}
            />

            {/* Vertical Resizer */}
            <ResizableDivider
              direction="vertical"
              isDragging={isVerticalDragging}
              onMouseDown={handleVerticalMouseDown}
            />

            {/* Test Cases Section */}
            <SampleTestCasesPanel
              height={100 - editorHeight}
              testCases={testCases}
              activeTestCase={activeTestCase}
              testResults={testResults}
              runError={runError}
              isRunning={isRunning}
              onTestCaseAdd={handleTestCaseAdd}
              onTestCaseDelete={handleTestCaseDelete}
              onTestCaseChange={handleTestCaseChange}
              onActiveTestCaseChange={setActiveTestCase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
