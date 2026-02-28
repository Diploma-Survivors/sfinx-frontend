"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useCodeExecution } from "@/hooks/use-code-execution";
import "@/lib/i18n";
import {
  InterviewChat,
  InterviewHeader,
  VoiceModeChat,
} from "@/components/interview";
import { InterviewFeedback } from "@/components/interview/interview-feedback";
import {
  LiveKitErrorBoundary,
  LiveKitProvider,
  TranscriptionHandler,
  VoiceChatIndicator,
} from "@/components/interview/livekit";
import { ResizableDivider } from "@/components/problems/tabs/description/dividers/resizable-divider";
import { EditorPanel } from "@/components/problems/tabs/description/panels/editor-panel/editor-panel";
import { SampleTestCasesPanel } from "@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel";
import { Button } from "@/components/ui/button";
import { useInterview } from "@/hooks/use-interview";
import { SubmissionsService } from "@/services/submissions-service";
import { toastService } from "@/services/toasts-service";
import { setProblem } from "@/store/slides/problem-slice";
import { selectWorkspace } from "@/store/slides/workspace-slice";
import { MessageRole } from "@/types/interview";
import { initialProblemData, ProblemStatus } from "@/types/problems";
import type { SampleTestCase } from "@/types/testcases";
import { Loader2 } from "lucide-react";

export default function InterviewSessionPage() {
  const { t } = useTranslation("interview");
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const interviewId = params?.id as string;

  const {
    phase,
    interview,
    messages,
    liveKitToken,
    evaluation,
    isLoading,
    isTyping,
    loadInterview,
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
  const [isInitializing, setIsInitializing] = useState(true);

  // Auto-enable voice from URL param (set by greeting page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("voice") === "1") {
      setVoiceEnabled(true);
    }
  }, []);

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

  const startTimeRef = useRef<number>(Date.now());
  const hasLoadedRef = useRef(false);

  // Load interview on mount (only once)
  useEffect(() => {
    if (!interviewId) {
      toastService.error(t("live.no_interview_id"));
      router.push("/interview");
      return;
    }

    // Prevent multiple loads
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadSession = async () => {
      setIsInitializing(true);
      try {
        await loadInterview(interviewId);
        await SubmissionsService.getLanguageList();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t("live.failed_to_load_interview");
        toastService.error(message);
        // Don't redirect on error to prevent loops - just show error state
        hasLoadedRef.current = false;
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
    // Only depend on interviewId - router and loadInterview are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Load problem data and test cases when interview is loaded
  useEffect(() => {
    if (interview?.problemSnapshot && interview?.problemId) {
      // Merge problem snapshot with default values to satisfy the Problem type
      const problemWithDefaults = {
        ...initialProblemData,
        ...interview.problemSnapshot,
        id: interview.problemId,
        status: ProblemStatus.NOT_STARTED,
        // Ensure difficulty is a valid enum value (problemSnapshot has it as string)
        difficulty: interview.problemSnapshot.difficulty as any,
      };
      dispatch(setProblem(problemWithDefaults));

      if (interview.problemSnapshot.sampleTestcases?.length) {
        setTestCases(
          interview.problemSnapshot.sampleTestcases.map(
            (tc: SampleTestCase, idx: number) => ({
              ...tc,
              id: tc.id || idx + 1,
            }),
          ),
        );
      } else {
        setTestCases([{ id: 1, input: "", expectedOutput: "" }]);
      }
    }
  }, [interview?.problemSnapshot, interview?.problemId, dispatch]);

  // Calculate interview time
  useEffect(() => {
    if (interview?.startedAt) {
      const startTime = new Date(interview.startedAt).getTime();
      const endTime = interview.endedAt
        ? new Date(interview.endedAt).getTime()
        : Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      setInterviewTime(elapsed);

      if (!interview.endedAt && phase === "active") {
        startTimeRef.current = startTime;
        const intervalId = setInterval(() => {
          const now = Date.now();
          const newElapsed = Math.floor((now - startTime) / 1000);
          setInterviewTime(newElapsed);
        }, 1000);
        return () => clearInterval(intervalId);
      }
    }
  }, [interview?.startedAt, interview?.endedAt, phase]);

  // Auto-connect voice when enabled
  useEffect(() => {
    if (isVoiceConnecting) return;

    if (voiceEnabled && interview && phase === "active" && !liveKitToken) {
      console.log("[VoiceAutoConnect] Connecting...");
      setIsVoiceConnecting(true);
      connectVoice()
        .then(() => console.log("[VoiceAutoConnect] Success"))
        .catch((err) => {
          console.error("[VoiceAutoConnect] Failed:", err);
          setVoiceEnabled(false);
        })
        .finally(() => setIsVoiceConnecting(false));
    }
  }, [
    voiceEnabled,
    interview,
    phase,
    liveKitToken,
    connectVoice,
    isVoiceConnecting,
  ]);

  const handleVoiceToggle = useCallback(async () => {
    const newVoiceEnabled = !voiceEnabled;
    console.log("[VoiceToggle]", {
      from: voiceEnabled,
      to: newVoiceEnabled,
      hasToken: !!liveKitToken,
    });

    if (newVoiceEnabled) {
      if (!liveKitToken) {
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
        setVoiceEnabled(true);
      }
    } else {
      setVoiceEnabled(false);
      setIsVoiceConnected(false);
      clearLiveKitToken();
    }
  }, [voiceEnabled, liveKitToken, connectVoice, clearLiveKitToken]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    try {
      await sendMessage(text, {
        code: code || t("live.no_code_written_yet"),
        language: language,
      });
    } catch (err) {
      console.error("[handleSendMessage] Error:", err);
    }
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
      await endInterview();
      router.push("/interview/history");
    } catch (error) {
      // Error handled by hook
    }
  }, [endInterview, router]);

  const handleRun = useCallback(
    async (sourceCode: string, languageId: number) => {
      if (!interview?.problemId) {
        toastService.error(t("live.no_active_interview"));
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

  if (isInitializing || !interview) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("live.loading_interview")}
          </h2>
          <p className="text-muted-foreground">{t("live.please_wait")}</p>
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

  if (phase === "completed" && evaluation) {
    return (
      <div className="min-h-[calc(100vh-64px)] overflow-auto">
        <InterviewFeedback
          interviewTime={interviewTime}
          evaluation={evaluation}
          onViewHistory={() => {
            // Stay on the same page but change phase to show read-only view
            setPhase("active");
          }}
        />
      </div>
    );
  }

  if (phase === "active" && interview) {
    // Determine if this is a read-only view (completed interview)
    const isReadOnly = interview.status === "completed";

    return (
      <LiveKitErrorBoundary
        fallback={
          <div className="flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden">
            <InterviewHeader
              interviewTime={interviewTime}
              voiceEnabled={false}
              voiceConnected={false}
              onVoiceToggle={() => {}}
              onEndInterview={handleEndInterview}
              isEnding={isLoading}
              problem={interview.problemSnapshot}
              readOnly={isReadOnly}
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("live.voice_unavailable_fallback")}
                </p>
                <Button onClick={() => window.location.reload()}>
                  {t("live.retry_connection")}
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <LiveKitProvider
          token={voiceEnabled && !isReadOnly ? liveKitToken : null}
          onConnected={() => {
            console.log("[LiveKit] Connected");
            setIsVoiceConnected(true);
          }}
          onDisconnected={() => {
            console.log("[LiveKit] Disconnected");
            setIsVoiceConnected(false);
          }}
          onError={(error) => {
            console.error("[LiveKit] Error:", error);
            toastService.error(t("live.voice_connection_error_fallback"));
            setVoiceEnabled(false);
            setIsVoiceConnected(false);
          }}
        >
          {isVoiceConnected && !isReadOnly && (
            <TranscriptionHandler
              onTranscript={handleVoiceTranscript}
              onTypingStart={() => setTyping(true)}
              onTypingEnd={() => setTyping(false)}
            />
          )}

          <div className="flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden">
            <InterviewHeader
              interviewTime={interviewTime}
              voiceEnabled={voiceEnabled && !isReadOnly}
              voiceConnected={isVoiceConnected && !isReadOnly}
              onVoiceToggle={handleVoiceToggle}
              onEndInterview={handleEndInterview}
              isEnding={isLoading}
              problem={interview.problemSnapshot}
              readOnly={isReadOnly}
            />

            {isReadOnly && (
              <div className="px-4 py-2 border-b bg-amber-50 dark:bg-amber-900/20 flex items-center gap-3">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Read-only mode: This interview is completed. You can view the
                  conversation and code but cannot make changes.
                </span>
              </div>
            )}

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
                  {voiceEnabled && !isReadOnly ? (
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
                          <VoiceChatIndicator isAgentSpeaking={isTyping} />
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
                      disabled={false}
                      readOnly={isReadOnly}
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
                  readOnly={isReadOnly}
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
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </LiveKitProvider>
      </LiveKitErrorBoundary>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
