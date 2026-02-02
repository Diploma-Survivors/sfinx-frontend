'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import '@/lib/i18n';
import { InterviewGreeting, InterviewGreetingSkeleton, InterviewHeader, InterviewChat } from '@/components/interview';
import { InterviewFeedback } from '@/components/interview/interview-feedback';
import { LiveKitProvider, DataChannelHandler, ConnectionAlert } from '@/components/interview/livekit';
import { EditorPanel } from '@/components/problems/tabs/description/panels/editor-panel/editor-panel';
import { SampleTestCasesPanel } from '@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel';
import { ResizableDivider } from '@/components/problems/tabs/description/dividers/resizable-divider';
import { useInterview, type InterviewPhase } from '@/hooks/use-interview';
import { useCodeSync } from '@/hooks/use-code-sync';
import { ProblemsService } from '@/services/problems-service';
import { toastService } from '@/services/toasts-service';
import { selectWorkspace } from '@/store/slides/workspace-slice';
import type { SampleTestCase } from '@/types/testcases';
import type { SSEResult } from '@/services/sse-service';
import { SortBy, SortOrder } from '@/types/problems';
import { MessageRole } from '@/types/interview';
import { Loader2 } from 'lucide-react';

// TODO: Implement proper problem selection UI
// For now, we fetch a random problem from the first page
async function fetchRandomProblem() {
  const response = await ProblemsService.getProblemList({
    page: 1,
    limit: 20,
    sortBy: SortBy.ID,
    sortOrder: SortOrder.ASC,
  });

  const problems = response.data.data?.data || [];
  if (problems.length === 0) {
    throw new Error('No problems available');
  }

  // Pick a random problem
  const randomProblem = problems[Math.floor(Math.random() * problems.length)];

  // Fetch full problem details
  const detailResponse = await ProblemsService.getProblemById(randomProblem.id);
  return detailResponse.data.data;
}

export default function LiveInterviewPage() {
  const { t } = useTranslation('interview');
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  // Interview state from hook
  const {
    phase,
    interview,
    messages,
    liveKitToken,
    evaluation,
    isLoading,
    startInterview,
    connectVoice,
    sendMessage,
    endInterview,
    addLocalMessage,
    setPhase,
  } = useInterview({
    onError: (error) => {
      toastService.error(error.message);
    },
  });

  // Local UI state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interviewTime, setInterviewTime] = useState(0);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);

  // Get code and language from Redux workspace
  const workspace = useSelector(selectWorkspace);
  const currentLanguage = workspace.currentLanguage;
  const currentCodeMap = interview?.problemId 
    ? workspace.currentCode[String(interview.problemId)] 
    : undefined;
  const code = (currentLanguage?.id && currentCodeMap?.[currentLanguage.id]) || '';
  const language = String(currentLanguage?.name || 'javascript');
  const [testResults, setTestResults] = useState<SSEResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testCases, setTestCases] = useState<SampleTestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resizable panel state
  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [isHD, setIsHD] = useState(false);
  const [isVD, setIsVD] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync code to backend for AI context
  useCodeSync({
    interviewId: interview?.id || null,
    code,
    language,
    enabled: phase === 'active',
    intervalMs: 5000,
  });

  // Timer for interview duration
  useEffect(() => {
    if (phase !== 'active') return;
    const timer = setInterval(() => setInterviewTime((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Handle voice connection when enabled
  useEffect(() => {
    // Prevent multiple concurrent connection attempts
    if (isVoiceConnecting) return;
    
    if (voiceEnabled && interview && phase === 'active' && !liveKitToken) {
      setIsVoiceConnecting(true);
      connectVoice()
        .catch(() => {
          // Fall back to text-only mode on connection failure
          setVoiceEnabled(false);
        })
        .finally(() => {
          setIsVoiceConnecting(false);
        });
    }
  }, [voiceEnabled, interview, phase, liveKitToken, connectVoice, isVoiceConnecting]);

  // Handle start interview with random problem
  const handleStartInterview = useCallback(async () => {
    setIsStarting(true);
    try {
      const problem = await fetchRandomProblem();

      // Initialize test cases from problem samples
      if (problem?.sampleTestcases?.length) {
        setTestCases(
          problem.sampleTestcases.map((tc: SampleTestCase, idx: number) => ({
            ...tc,
            id: tc.id || idx + 1,
          }))
        );
      } else {
        // Default test cases if none provided
        setTestCases([
          { id: 1, input: '', expectedOutput: '' },
        ]);
      }

      await startInterview(problem.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start interview';
      toastService.error(message);
    } finally {
      setIsStarting(false);
    }
  }, [startInterview]);

  // Handle sending text message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  }, [inputText, sendMessage]);

  // Handle voice transcript from data channel
  const handleVoiceTranscript = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      const messageRole = role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT;
      addLocalMessage(messageRole, content);
    },
    [addLocalMessage]
  );

  // Handle end interview
  const handleEndInterview = useCallback(async () => {
    try {
      await endInterview();
      // Redirect to history page after ending
      router.push('/interview/history');
    } catch (error) {
      // Error is handled by the hook
    }
  }, [endInterview, router]);

  // Handle run code (mock for now)
  const handleRun = useCallback(() => {
    setIsRunning(true);
    setRunError(null);
    // TODO: Integrate with actual code execution service
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        status: 'Accepted',
        totalTests: 1,
        passedTests: 1,
        runtime: '0.05s',
        memory: 10240,
        testResults: [
          {
            stdin: testCases[activeTestCase]?.input || '',
            stdout: 'Output',
            expectedOutput: testCases[activeTestCase]?.expectedOutput || '',
            status: 'Accepted',
            time: '0.05s',
            memory: 10240,
            token: '',
          },
        ],
      });
    }, 1000);
  }, [testCases, activeTestCase]);

  // Handle submit code
  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    // TODO: Integrate with actual submission service
    setTimeout(() => {
      setIsSubmitting(false);
      handleEndInterview();
    }, 1500);
  }, [handleEndInterview]);

  // Test case management
  const handleTestCaseAdd = useCallback(() => {
    const maxId = testCases.reduce((max, t) => ((t.id ?? 0) > max ? (t.id ?? 0) : max), 0);
    const newId = maxId + 1;
    setTestCases([...testCases, { id: newId, input: '', expectedOutput: '' }]);
    setActiveTestCase(testCases.length);
  }, [testCases]);

  const handleTestCaseDelete = useCallback(
    (id: number) => {
      if (testCases.length <= 1) return;
      const filtered = testCases.filter((t) => t.id !== id);
      setTestCases(filtered);
      const newIndex = Math.min(activeTestCase, filtered.length - 1);
      setActiveTestCase(newIndex < 0 ? 0 : newIndex);
    },
    [testCases, activeTestCase]
  );

  const handleTestCaseChange = useCallback(
    (id: number, field: 'input' | 'expectedOutput', value: string) => {
      setTestCases(testCases.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    },
    [testCases]
  );

  // Resizable panel handlers
  const handleHMouseDown = () => setIsHD(true);
  const handleVMouseDown = () => setIsVD(true);
  const handleMouseUp = () => {
    setIsHD(false);
    setIsVD(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if (isHD) {
      const rect = containerRef.current.getBoundingClientRect();
      const nw = ((e.clientX - rect.left) / rect.width) * 100;
      if (nw >= 30 && nw <= 70) setLeftWidth(nw);
    }
    if (isVD) {
      const rightPanel = containerRef.current.children[2] as HTMLElement;
      if (rightPanel) {
        const rect = rightPanel.getBoundingClientRect();
        const nh = ((e.clientY - rect.top) / rect.height) * 100;
        if (nh >= 40 && nh <= 80) setEditorHeight(nh);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Render greeting phase
  if (phase === 'greeting' && !interview) {
    if (isStarting) {
      return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
          <InterviewGreetingSkeleton />
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <InterviewGreeting
          voiceEnabled={voiceEnabled}
          onVoiceEnabledChange={setVoiceEnabled}
          onStartInterview={handleStartInterview}
          isLoading={isStarting}
        />
      </div>
    );
  }

  // Render connecting phase
  if (phase === 'connecting') {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connecting to voice room...</h2>
          <p className="text-muted-foreground">Please allow microphone access when prompted</p>
        </div>
      </div>
    );
  }

  // Render ending phase
  if (phase === 'ending') {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ending interview...</h2>
          <p className="text-muted-foreground">Generating your evaluation report</p>
        </div>
      </div>
    );
  }

  // Render active interview phase
  if (phase === 'active' && interview) {
    return (
      <LiveKitProvider
        token={voiceEnabled ? liveKitToken : null}
        onConnected={() => {
          console.log('LiveKit room connected');
          setIsVoiceConnected(true);
        }}
        onDisconnected={() => {
          console.log('LiveKit room disconnected');
          setIsVoiceConnected(false);
        }}
        onError={(error) => {
          console.error('LiveKit error:', error);
          toastService.error('Voice connection error. Falling back to text mode.');
          setVoiceEnabled(false);
          setIsVoiceConnected(false);
        }}
      >
        {/* Data channel handler for voice transcripts - only when actually connected */}
        {isVoiceConnected && <DataChannelHandler onTranscript={handleVoiceTranscript} />}

        <div className="flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden">
          <InterviewHeader
            interviewTime={interviewTime}
            voiceEnabled={voiceEnabled}
            voiceConnected={isVoiceConnected}
            onVoiceToggle={() => {
              if (!voiceEnabled && !liveKitToken) {
                setIsVoiceConnecting(true);
                connectVoice().finally(() => setIsVoiceConnecting(false));
              }
              setVoiceEnabled(!voiceEnabled);
              // Reset connection state when turning off
              if (voiceEnabled) {
                setIsVoiceConnected(false);
              }
            }}
            onEndInterview={handleEndInterview}
            isEnding={isLoading}
            problem={interview.problemSnapshot}
          />

          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            className="flex-1 flex relative overflow-hidden"
          >
            {/* Left panel - Chat */}
            <div className="flex flex-col h-full bg-card p-4" style={{ width: `${leftWidth}%` }}>
              <div className="flex-1 overflow-hidden">
                <InterviewChat
                  messages={messages}
                  inputText={inputText}
                  onInputChange={setInputText}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  disabled={phase !== 'active'}
                />
              </div>
            </div>

            <ResizableDivider
              direction="horizontal"
              isDragging={isHD}
              onMouseDown={handleHMouseDown}
            />

            {/* Right panel - Editor */}
            <div
              className="flex flex-col h-full overflow-hidden p-4 pl-0 bg-card"
              style={{ width: `${100 - leftWidth}%` }}
            >
              <EditorPanel
                contestMode={false}
                height={editorHeight}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
                onRun={handleRun}
                onSubmit={handleSubmit}
              />

              <ResizableDivider
                direction="vertical"
                isDragging={isVD}
                onMouseDown={handleVMouseDown}
              />

              <div className="mt-2 flex-1 overflow-hidden">
                <SampleTestCasesPanel
                  height={100}
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
      </LiveKitProvider>
    );
  }

  // Render feedback phase (if we somehow end up here without redirect)
  if (phase === 'completed' && evaluation) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <InterviewFeedback
          interviewTime={interviewTime}
          evaluation={evaluation}
          onStartNew={() => {
            setPhase('greeting');
            setInterviewTime(0);
          }}
        />
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
