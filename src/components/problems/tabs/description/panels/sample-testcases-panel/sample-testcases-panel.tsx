// import removed: getStatusMeta is handled inside child components now
import type { SSEResult } from '@/services/sse-service';
import type { SampleTestCase } from '@/types/testcases';
import { CheckCircle, Code } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CaseTabs } from './case-tabs';
import { ResultTab } from './result-tab';
import { TestcaseTab } from './testcase-tab';

interface SampleTestCasesPanelProps {
  height: number;
  testCases: SampleTestCase[];
  activeTestCase: number;
  testResults?: SSEResult | null;
  isRunning?: boolean;
  runError?: string | null;
  onTestCaseAdd: () => void;
  onTestCaseDelete: (id: number) => void;
  onTestCaseChange: (
    id: number,
    field: 'input' | 'expectedOutput',
    value: string
  ) => void;
  onActiveTestCaseChange: (index: number) => void;
}

export function SampleTestCasesPanel({
  height,
  testCases,
  activeTestCase,
  testResults,
  isRunning = false,
  runError = null,
  onTestCaseAdd,
  onTestCaseDelete,
  onTestCaseChange,
  onActiveTestCaseChange,
}: SampleTestCasesPanelProps) {
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');

  // Auto switch to Result tab when results arrive
  useEffect(() => {
    if (testResults?.testResults && testResults.testResults.length > 0) {
      setActiveTab('result');
    }
  }, [testResults]);

  // Auto switch to Result tab when starting to run
  useEffect(() => {
    if (isRunning) {
      setActiveTab('result');
    }
  }, [isRunning]);

  // True when there is at least one testcase result (used to control rendering)
  const hasResults = (testResults?.testResults?.length ?? 0) > 0;

  return (
    <div
      className="flex flex-col h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      style={{ height: `${height}%` }}
    >
      {/* Header Tabs */}
      <div className="flex items-center h-12 px-2 border-b border-border bg-background/50 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-1">
          {/* Testcase tab */}
          <button
            onClick={() => setActiveTab('testcase')}
            className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeTab === 'testcase'
                ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Testcase
          </button>

          {/* Result tab */}
          <button
            onClick={() => setActiveTab('result')}
            className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeTab === 'result'
                ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Test Result
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 relative overflow-y-auto min-h-0">
        {/* Show CaseTabs in all cases except when on the 'result' tab with no results yet */}
        {!(activeTab === 'result' && !hasResults) && (
          <CaseTabs
            activeTab={activeTab}
            hasResults={hasResults}
            testCases={testCases}
            activeTestCase={activeTestCase}
            testResults={testResults}
            onActiveTestCaseChange={onActiveTestCaseChange}
            onTestCaseDelete={onTestCaseDelete}
            onTestCaseAdd={onTestCaseAdd}
          />
        )}

        {/* Content */}
        {testCases[activeTestCase] && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {activeTab === 'result' ? (
              <ResultTab
                testCases={testCases}
                activeTestCase={activeTestCase}
                testResults={testResults}
                isRunning={isRunning}
                runError={runError}
              />
            ) : (
              <TestcaseTab
                testCases={testCases}
                activeTestCase={activeTestCase}
                onTestCaseChange={onTestCaseChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
