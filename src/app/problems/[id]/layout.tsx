'use client';

import { ResizableDivider } from '@/components/problems/tabs/description/dividers/resizable-divider';
import { EditorPanel } from '@/components/problems/tabs/description/panels/editor-panel/editor-panel';
import { SampleTestCasesPanel } from '@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel';
import { SubmitResultTab } from '@/components/problems/tabs/description/panels/submit-result/submit-result-tab';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ProblemDetailProvider,
  useProblemDetail,
} from '@/contexts/problem-detail-context';
import { cn } from '@/lib/utils';
import { CheckCircle, ChevronLeft, FileText, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

function ProblemLayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('problems');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const problemId = params.id as string;

  // Determine active tab based on URL path
  const segments = pathname.split('/');
  const lastSegment = segments.pop();
  const secondLastSegment = segments.pop();

  const validTabs = ['description', 'submissions', 'solutions'];
  let activeTab = 'description';

  if (validTabs.includes(lastSegment || '')) {
    activeTab = lastSegment || 'description';
  } else if (validTabs.includes(secondLastSegment || '')) {
    activeTab = secondLastSegment || 'description';
  }

  const isCreateSolution = pathname.includes('/solutions/create');
  const isEditSolution = pathname.includes('/solutions/edit');
  const isFullPage = isCreateSolution || isEditSolution;

  const {
    containerRef,
    rightPanelRef,
    leftWidth,
    editorHeight,
    isHorizontalDragging,
    isVerticalDragging,
    handleHorizontalMouseDown,
    handleVerticalMouseDown,
    testCases,
    activeTestCase,
    setActiveTestCase,
    handleTestCaseAdd,
    handleTestCaseDelete,
    handleTestCaseChange,
    isRunning,
    isSubmitting,
    testResults,
    submitResults,
    runError,
    handleRun,
    handleSubmit,
    clearSubmitResults,
    problem,
    isLoading,
  } = useProblemDetail();

  const navItems = [
    { id: 'description', label: t('nav_description'), icon: FileText },
    { id: 'submissions', label: t('nav_submissions'), icon: CheckCircle },
    { id: 'solutions', label: t('nav_solutions'), icon: Lightbulb },
  ];

  if (isLoading && !problem) {
    return (
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <div className="flex-1 flex gap-0">
          <div className="w-1/2 p-4 space-y-6 border-r border-border">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-64 rounded-md" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="w-1/2 p-4 space-y-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div
        ref={containerRef}
        className="flex-1 flex gap-0 relative overflow-hidden"
      >
        {/* Left Panel */}
        <div
          className={cn(
            'flex flex-col h-full bg-card',
            !isFullPage && 'border-r border-border'
          )}
          style={{ width: isFullPage ? '100%' : `${leftWidth}%` }}
        >
          {/* Left Panel Header - Concise Navigation */}
          {!isFullPage && (
            <div className="flex items-center h-12 px-2 border-b border-border bg-background/50 backdrop-blur-sm shrink-0 gap-2">
              <Link href="/problems">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={t('back_to_list')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>

              <div className="h-4 w-px bg-border mx-1" />

              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() =>
                        router.push(`/problems/${problemId}/${item.id}`)
                      }
                      className={cn(
                        'h-8 text-xs font-medium gap-2 px-3',
                        isActive
                          ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

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
              children
            )}
          </div>
        </div>

        {/* Horizontal Resizer */}
        {!isFullPage && (
          <ResizableDivider
            direction="horizontal"
            isDragging={isHorizontalDragging}
            onMouseDown={handleHorizontalMouseDown}
          />
        )}

        {/* Right Panel - Editor and Test Cases */}
        {!isFullPage && (
          <div
            ref={rightPanelRef}
            className="flex flex-col overflow-hidden pb-4 bg-card"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="flex flex-col h-full gap-0">
              {/* Editor Section */}
              <EditorPanel
                contestMode={false}
                height={editorHeight}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
                onRun={handleRun}
                onSubmit={(code, langId, contestId) =>
                  handleSubmit(code, langId, contestId)
                }
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
        )}
      </div>
    </div>
  );
}

export default function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProblemDetailProvider>
      <ProblemLayoutInner>{children}</ProblemLayoutInner>
    </ProblemDetailProvider>
  );
}
