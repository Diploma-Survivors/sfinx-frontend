'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormattedMarkdown from '@/components/ui/formatted-markdown';
import { SubmissionsService } from '@/services/submissions-service';
import type { AppDispatch, RootState } from '@/store';
import {
  generateAIReview,
  resetReview,
} from '@/store/slides/ai-review-slice';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface AIReviewModalProps {
  submissionId: string;
  isOpen: boolean;
  onClose: () => void;
  persistedReview?: string | null;
}

export default function AIReviewModal({
  submissionId,
  isOpen,
  onClose,
  persistedReview,
}: AIReviewModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { aiResponse, isLoading, error } = useSelector(
    (state: RootState) => state.aiReview
  );
  const [polledReview, setPolledReview] = useState<string | null>(persistedReview || null);
  const [isPolling, setIsPolling] = useState(false);

  // Trigger review generation when modal opens
  useEffect(() => {
    if (isOpen && !aiResponse && !persistedReview && !isLoading && !error) {
      dispatch(generateAIReview({ submissionId }));
    }
  }, [isOpen, submissionId, aiResponse, persistedReview, isLoading, error, dispatch]);

  // Reset review when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(resetReview());
      setPolledReview(null);
      setIsPolling(false);
    }
  }, [isOpen, dispatch]);

  // Poll for review if there was a timeout error
  useEffect(() => {
    if (!error || !isOpen) return;
    
    // Check if error is a timeout
    const isTimeout = error.toLowerCase().includes('timeout') || 
                      error.toLowerCase().includes('exceeded');
    
    if (isTimeout && !isPolling) {
      setIsPolling(true);
      
      // Poll every 3 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
          const response = await SubmissionsService.getSubmissionById(Number(submissionId));
          const review = response.data.data?.aiReview;
          
          if (review) {
            setPolledReview(review);
            setIsPolling(false);
            clearInterval(pollInterval);
          }
        } catch (e) {
          // Silently fail polling
        }
        
        if (attempts >= maxAttempts) {
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      }, 3000);
      
      return () => clearInterval(pollInterval);
    }
  }, [error, isOpen, submissionId, isPolling]);

  const displayReview = aiResponse || polledReview || persistedReview;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI Code Review
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis for Submission #{submissionId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 min-h-[300px]">
          {isLoading || isPolling ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
              <p className="text-muted-foreground">
                {isPolling ? 'Checking for saved review...' : 'Analyzing your code with AI...'}
              </p>
              <p className="text-xs text-muted-foreground">
                This may take up to 2 minutes
              </p>
            </div>
          ) : error && !displayReview ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <div className="text-destructive text-lg">⚠️</div>
              <p className="text-destructive font-medium">
                Failed to generate review
              </p>
              <p className="text-muted-foreground text-sm max-w-md">
                {error}
              </p>
              <button
                onClick={() => dispatch(generateAIReview({ submissionId }))}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : displayReview ? (
            <FormattedMarkdown content={displayReview} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <Sparkles className="w-12 h-12 opacity-20" />
              <p className="text-sm">Ready to review your code</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
