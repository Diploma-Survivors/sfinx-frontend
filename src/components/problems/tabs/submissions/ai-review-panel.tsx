'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AppDispatch, RootState } from '@/store';
import {
  generateAIReview,
  resetReview,
  setCustomPrompt,
  toggleVisibility,
} from '@/store/slides/ai-review-slice';
import { CheckCircle2, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';

interface AIReviewPanelProps {
  submissionId: string;
  sourceCode: string;
  persistedReview?: string | null;
}

export default function AIReviewPanel({
  submissionId,
  sourceCode,
  persistedReview,
}: AIReviewPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { customPrompt, aiResponse, isLoading, cached } = useSelector(
    (state: RootState) => state.aiReview
  );

  // Load persisted review when panel opens
  useEffect(() => {
    if (persistedReview) {
      // If there's a persisted review, show it
      // We don't dispatch to avoid triggering a new review generation
    }
  }, [persistedReview]);

  const handleSubmit = () => {
    dispatch(generateAIReview({ submissionId, customPrompt }));
  };

  // Use persisted review if no generated review yet
  const displayReview = aiResponse || persistedReview;

  return (
    <div className="h-full rounded-xl flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700">
      <div className="pl-4 pr-4 pb-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI Review
          </h3>
          <button
            onClick={() => dispatch(toggleVisibility())}
            className="pl-4 pb-4 pt-2 rounded cursor-pointer dark:hover:bg-slate-800"
          >
            <span className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 text-xl">
              &times;
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {/* <div className="flex items-center justify-between">
            <label htmlFor="customize-prompt" className="text-sm font-medium">
              Tiêu chí nhận xét
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Tùy chỉnh</span>

              <button
                onClick={() => dispatch(setIsCustomizing(!isCustomizing))}
                className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors 
                            ${isCustomizing ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${isCustomizing ? 'translate-x-4' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {isCustomizing && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <textarea
                value={customPrompt}
                onChange={(e) => dispatch(setCustomPrompt(e.target.value))}
                placeholder="Nhập prompt tùy chỉnh tại đây..."
                className="min-h-[300px] w-full focus:outline-none focus:ring-0 focus:border-none text-sm resize-none"
              />
              <div className="flex justify-between ">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch(setIsCustomizing(!isCustomizing))}
                  className="text-xs h-7"
                >
                  Lưu thay đổi
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch(resetPrompt())}
                  className="text-xs h-7"
                >
                  Khôi phục mặc định
                </Button>
              </div>
            </div>
          )}

          {!isCustomizing && (
            <div
              className="text-sm text-slate-500 italic border p-2 rounded bg-slate-50 dark:bg-slate-800 
                                        w-full line-clamp-4"
            >
              {customPrompt}
            </div>
          )} */}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-8 text-sm bg-green-600 hover:bg-green-700 text-white"
            variant={aiResponse ? 'secondary' : 'default'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : aiResponse ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Regenerate Review
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Nhận review từ AI
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {displayReview ? (
          <div className="space-y-3">
            {(cached || persistedReview) && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {cached ? 'Generated just now' : 'Saved review'}
              </Badge>
            )}
            <div className="prose dark:prose-invert max-w-none text-sm">
              <ReactMarkdown>{displayReview}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Sparkles className="w-12 h-12 opacity-20" />
            <p className="text-sm">Ready to review your code</p>
          </div>
        )}
      </div>
    </div>
  );
}
