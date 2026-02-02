import { getStatusMeta } from '@/lib/utils/testcase-status';
import { SubmissionStatus } from '@/types/submissions';
import type { SSEResult } from '@/services/sse-service';
import type { SampleTestCase } from '@/types/testcases';
import { Plus, X } from 'lucide-react';

type ActiveTab = 'testcase' | 'result';

interface CaseTabsProps {
  activeTab: ActiveTab;
  hasResults: boolean;
  testCases: SampleTestCase[];
  activeTestCase: number;
  testResults?: SSEResult | null;
  onActiveTestCaseChange: (index: number) => void;
  onTestCaseDelete: (id: number) => void;
  onTestCaseAdd: () => void;
}

export function CaseTabs({
  activeTab,
  hasResults,
  testCases,
  activeTestCase,
  testResults,
  onActiveTestCaseChange,
  onTestCaseDelete,
  onTestCaseAdd,
}: CaseTabsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case SubmissionStatus.WRONG_ANSWER:
      case 'WRONG_ANSWER':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case SubmissionStatus.COMPILATION_ERROR:
      case 'COMPILATION_ERROR':
      case SubmissionStatus.RUNTIME_ERROR:
      case 'RUNTIME_ERROR':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent shrink-0 w-full">
      {testCases.map((testCase, index) => {
        const testResult =
          testResults?.testResults && index < testResults.testResults.length
            ? testResults.testResults[index]
            : null;
        const statusInfo =
          activeTab === 'result' && testResult
            ? getStatusMeta(testResult.status)
            : null;

        const isActive = activeTestCase === index;

        // Determine styling
        let tabStyle =
          'bg-background border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/80';

        if (activeTab === 'result' && testResult && isActive) {
          // In result tab, use status colors ONLY for active tab
          const statusColor = getStatusColor(testResult.status);
          tabStyle = `${statusColor}`;
        } else if (isActive) {
          // Normal active state
          tabStyle =
            'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5';
        }

        return (
          <div key={testCase.id} className="relative group shrink-0">
            <button
              onClick={() => onActiveTestCaseChange(index)}
              className={`h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 border cursor-pointer ${tabStyle}`}
            >
              {/* Show status icon for result tab */}
              {activeTab === 'result' && statusInfo ? (
                <span
                  className={isActive ? 'text-current' : statusInfo.iconColor}
                >
                  {statusInfo.icon}
                </span>
              ) : null}
              Case {index + 1}
            </button>

            {activeTab === 'testcase' && testCases.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTestCaseDelete(testCase.id ?? 0);
                }}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-destructive hover:border-destructive hover:text-destructive-foreground z-10 cursor-pointer"
                aria-label="Delete testcase"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {activeTab === 'testcase' && (
        <button
          onClick={onTestCaseAdd}
          className="h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 flex items-center gap-1 border border-transparent hover:border-border shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      )}
    </div>
  );
}
