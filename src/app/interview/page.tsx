"use client";

import {
  InterviewChat,
  InterviewGreeting,
  InterviewGreetingSkeleton,
  InterviewHeader,
  VoiceModeChat,
  InterviewCustomizationModal,
  InterviewTimer,
} from "@/components/interview";
import { InterviewFeedback } from "@/components/interview/interview-feedback";
import {
  LiveKitErrorBoundary,
  LiveKitProvider,
  TranscriptionHandler,
  VoiceChatIndicator,
} from "@/components/interview/livekit";
import { PremiumModal } from "@/components/problems/premium-modal";
import { ResizableDivider } from "@/components/problems/tabs/description/dividers/resizable-divider";
import { EditorPanel } from "@/components/problems/tabs/description/panels/editor-panel/editor-panel";
import { SampleTestCasesPanel } from "@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel";
import { useApp } from "@/contexts/app-context";
import { useCodeExecution } from "@/hooks/use-code-execution";
import { useInterview } from "@/hooks/use-interview";
import "@/lib/i18n";
import { ProblemsService } from "@/services/problems-service";
import { SubmissionsService } from "@/services/submissions-service";
import { toastService } from "@/services/toasts-service";
import { setProblem } from "@/store/slides/problem-slice";
import { selectWorkspace, updateCurrentCode } from "@/store/slides/workspace-slice";
import type { InterviewLanguage, InterviewMode, InterviewDifficulty, InterviewerPersonality } from "@/types/interview";
import { MessageRole } from "@/types/interview";
import { SortBy, SortOrder } from "@/types/problems";
import type { Problem } from "@/types/problems";
import type { SampleTestCase } from "@/types/testcases";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

async function fetchRandomProblem() {
  const response = await ProblemsService.getProblemList({
    page: 1,
    limit: 20,
    sortBy: SortBy.ID,
    sortOrder: SortOrder.ASC,
  });

  const problems = response.data.data?.data || [];
  if (problems.length === 0) {
    throw new Error("No problems available");
  }

  const randomProblem = problems[Math.floor(Math.random() * problems.length)];
  const detailResponse = await ProblemsService.getProblemById(randomProblem.id);
  return detailResponse.data.data;
}

async function fetchProblemById(problemId: number): Promise<Problem | null> {
  try {
    const detailResponse = await ProblemsService.getProblemById(problemId);
    return detailResponse.data.data;
  } catch {
    return null;
  }
}

export default function LiveInterviewPage() {
  const { t } = useTranslation("interview");
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemIdFromQuery = searchParams.get('problemId');
  const dispatch = useDispatch();
  const [isStarting, setIsStarting] = useState(false);
  const { isLoggedin, isEmailVerified, user } = useApp();


  const {
    phase,
    interview,
    messages,
    liveKitToken,
    evaluation,
    isLoading,
    isTyping,
    startInterview,
    connectVoice,
    sendMessage,
    endInterview,
    addLocalMessage,
    setTyping,
    setPhase,
    clearLiveKitToken,
  } = useInterview({
    onError: (error) => {
      toastService.error(error.message);
    },
  });

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [inputText, setInputText] = useState("");
  const [interviewTime, setInterviewTime] = useState(0);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<InterviewLanguage>("en");

  const workspace = useSelector(selectWorkspace);
  const currentLanguageId = interview?.problemId
    ? (workspace.currentLanguage?.[String(interview.problemId)] ?? 46)
    : 46;
  const currentCodeMap = interview?.problemId
    ? workspace.currentCode[String(interview.problemId)]
    : undefined;
  const code = currentCodeMap?.[currentLanguageId] || "";
  const languageObj = workspace.languages?.find(
    (l) => l.id === currentLanguageId,
  );
  const language = String(languageObj?.name || "javascript");

  // Use the real code execution hook instead of mock states
  const {
    isRunning,
    testResults,
    runError,
    handleRun: executeRun,
  } = useCodeExecution();

  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testCases, setTestCases] = useState<SampleTestCase[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [isHD, setIsHD] = useState(false);
  const [isVD, setIsVD] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  // Timer for interview duration
  const startTimeRef = useRef<number>(Date.now());
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (phase === "active") {
      startTimeRef.current = Date.now() - interviewTime * 1000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, interviewTime]);

  useEffect(() => {
    if (phase !== "active") return;
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setInterviewTime(elapsed);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [phase]);

  // Auto-connect voice when enabled
  useEffect(() => {
    if (isVoiceConnecting || !voiceEnabled || !interview || phase !== "active" || liveKitToken) return;

    setIsVoiceConnecting(true);
    connectVoice()
      .catch(() => setVoiceEnabled(false))
      .finally(() => setIsVoiceConnecting(false));
  }, [voiceEnabled, interview, phase, liveKitToken, connectVoice, isVoiceConnecting]);

  // Load specific problem from query parameter
  useEffect(() => {
    if (problemIdFromQuery && phase === 'greeting' && !selectedProblem && !isLoadingProblem) {
      const loadProblem = async () => {
        // Validate problemId
        const problemId = Number.parseInt(problemIdFromQuery);
        if (Number.isNaN(problemId) || problemId <= 0) {
          toastService.error(t('invalid_problem_id'));
          return;
        }

        setIsLoadingProblem(true);
        try {
          const problem = await fetchProblemById(problemId);
          if (problem) {
            setSelectedProblem(problem);
            // Pre-populate test cases
            if (problem.sampleTestcases?.length) {
              setTestCases(
                problem.sampleTestcases.map((tc: SampleTestCase, idx: number) => ({
                  ...tc,
                  id: tc.id || idx + 1,
                })),
              );
            }
          } else {
            toastService.error(t('problem_not_found'));
          }
        } catch (error) {
          toastService.error(t('failed_to_load_problem'));
        } finally {
          setIsLoadingProblem(false);
        }
      };
      loadProblem();
    }
  }, [problemIdFromQuery, phase, selectedProblem, isLoadingProblem, t]);

  // Redirect to session URL when interview is created (only once)
  useEffect(() => {
    if (
      interview?.id &&
      phase === "active" &&
      !isStarting &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;
      const voiceParam = voiceEnabled ? '?voice=1' : '';
      router.push(`/interview/${interview.id}${voiceParam}`);
    }
  }, [interview?.id, phase, isStarting, router, voiceEnabled]);

  const handleVoiceToggle = useCallback(async () => {
    if (!voiceEnabled) {
      setIsVoiceConnecting(true);
      try {
        await connectVoice();
        setVoiceEnabled(true);
      } catch {
        setVoiceEnabled(false);
        setIsVoiceConnected(false);
      } finally {
        setIsVoiceConnecting(false);
      }
    } else {
      setVoiceEnabled(false);
      setIsVoiceConnected(false);
      clearLiveKitToken();
    }
  }, [voiceEnabled, connectVoice, clearLiveKitToken]);

  // Opens the customization modal after auth checks
  const handleStartInterview = useCallback(async () => {
    if (!isLoggedin) {
      toastService.error(t("login_required_action"));
      return;
    }
    if (!isEmailVerified) {
      toastService.error(t("email_verification_required_action"));
      return;
    }
    if(user && !user.isPremium) {
      setIsPremiumModalOpen(true);
      return;
    }
    
    // Open customization modal
    setIsCustomizationModalOpen(true);
  }, [isLoggedin, isEmailVerified, user, t]);

  // Actually starts the interview with selected customization
  const handleConfirmCustomization = useCallback(async (
    mode: InterviewMode,
    difficulty: InterviewDifficulty,
    personality: InterviewerPersonality
  ) => {
    setIsStarting(true);
    setIsCustomizationModalOpen(false);
    
    try {
      let problem: Problem;
      
      if (selectedProblem) {
        // Use pre-selected problem
        problem = selectedProblem;
      } else {
        // Fall back to random problem
        problem = await fetchRandomProblem();
      }
      
      if (problem?.sampleTestcases?.length) {
        setTestCases(
          problem.sampleTestcases.map((tc: SampleTestCase, idx: number) => ({
            ...tc,
            id: tc.id || idx + 1,
          })),
        );
      } else {
        setTestCases([{ id: 1, input: "", expectedOutput: "" }]);
      }
      
      await startInterview(problem.id, selectedLanguage, mode, difficulty, personality);
      dispatch(setProblem(problem));

      // Initialize workspace with starter code if empty
      const problemId = problem.id;
      const languageId = workspace.currentLanguage?.[String(problemId)] ?? 11;
      const existingCode = workspace.currentCode?.[problemId]?.[languageId];
      if (!existingCode) {
        const starterCode = workspace.languages?.find((l) => l.id === languageId)?.starterCode ?? "";
        if (starterCode) {
          dispatch(updateCurrentCode({ problemId, languageId, code: starterCode }));
        }
      }

      await SubmissionsService.getLanguageList();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("live.failed_to_start_interview");
      toastService.error(message);
    } finally {
      setIsStarting(false);
    }
  }, [startInterview, dispatch, selectedProblem, selectedLanguage, t]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    await sendMessage(text, {
      code: code || "// No code written yet",
      language: language,
    });
  }, [inputText, sendMessage, code, language]);

  const handleVoiceTranscript = useCallback(
    (role: "user" | "assistant", content: string, messageId?: string) => {
      const messageRole =
        role === "user" ? MessageRole.USER : MessageRole.ASSISTANT;
      addLocalMessage(messageRole, content, messageId);
    },
    [addLocalMessage],
  );

  const handleEndInterview = useCallback(async () => {
    try {
      // Use numeric problemId as key (consistent with how code is stored in workspace)
      const problemId = interview?.problemId;
      const currentCode = problemId
        ? (workspace.currentCode[problemId]?.[currentLanguageId] || '')
        : '';
      await endInterview(currentCode, currentLanguageId);
      router.push("/interview/history");
    } catch (error) {
      // Error handled by hook
    }
  }, [endInterview, router, workspace.currentCode, interview?.problemId, currentLanguageId]);

  const handleRun = useCallback(
    async (sourceCode: string, languageId: number) => {
      if (!interview?.problemId) {
        toastService.error("No active interview");
        return;
      }

      const testCasesForSubmission = testCases.map((tc) => ({
        input: tc.input,
        output: tc.expectedOutput,
      }));

      await executeRun(
        sourceCode,
        languageId,
        interview.problemId,
        testCasesForSubmission,
      );
    },
    [interview?.problemId, testCases, executeRun],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleEndInterview();
    }, 1500);
  }, [handleEndInterview]);

  const handleTestCaseAdd = useCallback(() => {
    const maxId = testCases.reduce(
      (max, t) => ((t.id ?? 0) > max ? (t.id ?? 0) : max),
      0,
    );
    const newId = maxId + 1;
    setTestCases([...testCases, { id: newId, input: "", expectedOutput: "" }]);
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
    [testCases, activeTestCase],
  );

  const handleTestCaseChange = useCallback(
    (id: number, field: "input" | "expectedOutput", value: string) => {
      setTestCases(
        testCases.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
      );
    },
    [testCases],
  );

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
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  if (phase === "greeting" && !interview) {
    if (isStarting) {
      return (
        <div className="h-screen overflow-hidden">
          <InterviewGreetingSkeleton />
        </div>
      );
    }
    // Show problem info if one is selected
    const problemDisplay = selectedProblem ? (
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Selected Problem:</p>
        <h3 className="text-lg font-semibold">{selectedProblem.title}</h3>
        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
          selectedProblem.difficulty === 'easy'
            ? 'bg-green-500/10 text-green-600'
            : selectedProblem.difficulty === 'medium'
            ? 'bg-yellow-500/10 text-yellow-600'
            : 'bg-red-500/10 text-red-600'
        }`}>
          {selectedProblem.difficulty}
        </span>
      </div>
    ) : null;

    return (
      <div className="h-screen overflow-hidden">
        <InterviewGreeting
          voiceEnabled={voiceEnabled}
          onVoiceEnabledChange={setVoiceEnabled}
          onStartInterview={handleStartInterview}
          onViewHistory={() => {
            if(!isLoggedin) {
              toastService.error(t("login_required_action"));
              return;
            }
            if(!isEmailVerified) {
              toastService.error(t("email_verification_required_action"));
              return;
            }
            if(user && !user.isPremium) {
              setIsPremiumModalOpen(true);
              return;
            }

            router.push('/interview/history');
          }}
          isLoading={isStarting}
          problemDisplay={problemDisplay}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
        />
        <InterviewCustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          onConfirm={handleConfirmCustomization}
          isLoading={isStarting}
        />
      </div>
      
    );
  }

  if (phase === "connecting") {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("live.connecting_voice_room")}
          </h2>
          <p className="text-muted-foreground">
            {t("live.allow_microphone_access")}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "ending") {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("live.ending_interview")}
          </h2>
          <p className="text-muted-foreground">
            {t("live.generating_evaluation_report")}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "active" && interview) {
    return (
      <LiveKitErrorBoundary
        onError={() => {
          setVoiceEnabled(false);
          setIsVoiceConnected(false);
        }}
      >
        <LiveKitProvider
          token={liveKitToken}
          audioEnabled={voiceEnabled}
          onConnected={() => setIsVoiceConnected(true)}
          onDisconnected={() => {
            setIsVoiceConnected(false);
            clearLiveKitToken();
          }}
          onError={() => {
            toastService.error(t("live.voice_connection_error_fallback"));
            setVoiceEnabled(false);
            setIsVoiceConnected(false);
          }}
        >
          {isVoiceConnected && (
            <TranscriptionHandler
              onTranscript={handleVoiceTranscript}
              onTypingStart={() => setTyping(true)}
              onTypingEnd={() => setTyping(false)}
            />
          )}

          {/* Timer Header */}
          {interview?.scheduledEndAt && interview.status === 'active' && (
            <InterviewTimer
              scheduledEndAt={interview.scheduledEndAt}
              onTimeExpired={() => {
                toastService.info(t('timer.expired'));
                // Poll for status change - will redirect when status becomes completed
                const checkStatus = setInterval(() => {
                  // Refresh interview data
                  window.location.reload();
                }, 5000);

                // Stop polling after 60 seconds
                setTimeout(() => clearInterval(checkStatus), 60000);
              }}
            />
          )}

          <div className={`flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden ${interview?.scheduledEndAt && interview.status === 'active' ? 'pt-12' : ''}`}>
            <InterviewHeader
              interviewTime={interviewTime}
              voiceEnabled={voiceEnabled}
              voiceConnected={isVoiceConnected}
              onVoiceToggle={handleVoiceToggle}
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
              <div
                className="flex flex-col h-full bg-card p-4"
                style={{ width: `${leftWidth}%` }}
              >
                <div className="flex-1 overflow-hidden">
                  {voiceEnabled ? (
                    <VoiceModeChat
                      messages={messages}
                      inputText={inputText}
                      onInputChange={setInputText}
                      onSendMessage={handleSendMessage}
                      onEndInterview={handleEndInterview}
                      isLoading={isLoading || isTyping}
                      isAgentSpeaking={isTyping}
                      voiceConnected={isVoiceConnected}
                      interviewStartedAt={interview.startedAt}
                      isEnding={isLoading}
                      voiceIndicator={
                        isVoiceConnected ? (
                          <VoiceChatIndicator
                            isAgentSpeaking={isTyping}
                          />
                        ) : undefined
                      }
                    />
                  ) : (
                    <InterviewChat
                      messages={messages}
                      inputText={inputText}
                      onInputChange={setInputText}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading || isTyping}
                      disabled={phase !== "active"}
                    />
                  )}
                </div>
              </div>

              <ResizableDivider
                direction="horizontal"
                isDragging={isHD}
                onMouseDown={handleHMouseDown}
              />

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
      </LiveKitErrorBoundary>
    );
  }

  if (phase === "completed" && evaluation) {
    return (
      <div className="min-h-[calc(100vh-64px)] overflow-auto">
        <InterviewFeedback
          interviewTime={interviewTime}
          evaluation={evaluation}
          onStartNew={() => {
            setPhase("greeting");
            setInterviewTime(0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  
}
