"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "@/lib/i18n";
import {
  InterviewChat,
  InterviewGreeting,
  InterviewGreetingSkeleton,
  InterviewHeader,
} from "@/components/interview";
import { InterviewFeedback } from "@/components/interview/interview-feedback";
import {
  AudioLevelIndicator,
  ConnectionAlert,
  DataChannelHandler,
  LiveKitErrorBoundary,
  LiveKitProvider,
} from "@/components/interview/livekit";
import { ResizableDivider } from "@/components/problems/tabs/description/dividers/resizable-divider";
import { EditorPanel } from "@/components/problems/tabs/description/panels/editor-panel/editor-panel";
import { SampleTestCasesPanel } from "@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel";
import { Button } from "@/components/ui/button";
import { type InterviewPhase, useInterview } from "@/hooks/use-interview";
import { ProblemsService } from "@/services/problems-service";
import type { SSEResult } from "@/services/sse-service";
import { toastService } from "@/services/toasts-service";
import { selectWorkspace } from "@/store/slides/workspace-slice";
import { MessageRole } from "@/types/interview";
import { SortBy, SortOrder } from "@/types/problems";
import type { SampleTestCase } from "@/types/testcases";
import { Loader2 } from "lucide-react";

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

export default function LiveInterviewPage() {
  const { t } = useTranslation("interview");
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

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
    updateMessage,
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

  const workspace = useSelector(selectWorkspace);
  const currentLanguage = workspace.currentLanguage;
  const currentCodeMap = interview?.problemId
    ? workspace.currentCode[String(interview.problemId)]
    : undefined;
  const code =
    (currentLanguage?.id && currentCodeMap?.[currentLanguage.id]) || "";
  const language = String(currentLanguage?.name || "javascript");

  const [testResults, setTestResults] = useState<SSEResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testCases, setTestCases] = useState<SampleTestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [isHD, setIsHD] = useState(false);
  const [isVD, setIsVD] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track streaming message state
  const streamingMsgIdRef = useRef<string | null>(null);
  const streamingContentRef = useRef<string>("");

  // Timer for interview duration
  const startTimeRef = useRef<number>(Date.now());

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

  const handleStartInterview = useCallback(async () => {
    setIsStarting(true);
    try {
      const problem = await fetchRandomProblem();
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
      await startInterview(problem.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start interview";
      toastService.error(message);
    } finally {
      setIsStarting(false);
    }
  }, [startInterview]);

  const handleSendMessage = useCallback(async () => {
    console.log(
      "[handleSendMessage] Called, input:",
      inputText.substring(0, 50),
    );
    if (!inputText.trim()) {
      console.log("[handleSendMessage] Empty input, returning");
      return;
    }
    const text = inputText;
    setInputText("");
    console.log("[handleSendMessage] Calling sendMessage...");
    try {
      await sendMessage(text, {
        code: code || "// No code written yet",
        language: language,
      });
      console.log("[handleSendMessage] sendMessage completed");
    } catch (err) {
      console.error("[handleSendMessage] Error:", err);
    }
  }, [inputText, sendMessage, code, language]);

  /**
   * Handle final transcript from voice
   * For USER messages: always add (they don't stream)
   * For ASSISTANT messages: only add if we weren't streaming (streaming creates its own message)
   */
  const handleVoiceTranscript = useCallback(
    (role: "user" | "assistant", content: string, messageId?: string) => {
      console.log("[Transcript] Received:", {
        role,
        content: content.substring(0, 50),
        messageId,
      });

      const messageRole =
        role === "user" ? MessageRole.USER : MessageRole.ASSISTANT;

      if (role === "user") {
        // User messages from voice - always add them
        console.log("[Transcript] Adding user voice message");
        addLocalMessage(messageRole, content, messageId);
      } else {
        // Assistant final transcript
        // If we were streaming, the streaming message already exists
        // Just finalize it by updating with full content
        if (streamingMsgIdRef.current && streamingContentRef.current) {
          console.log("[Transcript] Finalizing streaming message");
          updateMessage(streamingMsgIdRef.current, content);
          // Reset streaming state
          streamingMsgIdRef.current = null;
          streamingContentRef.current = "";
        } else {
          // No streaming was happening, add as new message
          console.log("[Transcript] Adding non-streaming assistant message");
          addLocalMessage(messageRole, content, messageId);
        }
      }
    },
    [addLocalMessage, updateMessage],
  );

  /**
   * Handle streaming transcript delta (word-by-word from AI)
   */
  const handleTranscriptDelta = useCallback(
    (role: "assistant", delta: string, messageId: string) => {
      // Always accumulate to our streaming ref
      if (streamingMsgIdRef.current !== messageId) {
        // New streaming session
        console.log("[TranscriptDelta] Starting new stream:", messageId);
        streamingMsgIdRef.current = messageId;
        streamingContentRef.current = delta;
        addLocalMessage(MessageRole.ASSISTANT, delta, messageId);
      } else {
        // Continue existing stream
        streamingContentRef.current += delta;
        updateMessage(messageId, streamingContentRef.current);
      }
    },
    [addLocalMessage, updateMessage],
  );

  const handleEndInterview = useCallback(async () => {
    try {
      await endInterview();
      router.push("/interview/history");
    } catch (error) {
      // Error handled by hook
    }
  }, [endInterview, router]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setRunError(null);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults({
        status: "Accepted",
        totalTests: 1,
        passedTests: 1,
        runtime: "0.05s",
        memory: 10240,
        testResults: [
          {
            stdin: testCases[activeTestCase]?.input || "",
            stdout: "Output",
            expectedOutput: testCases[activeTestCase]?.expectedOutput || "",
            status: "Accepted",
            time: "0.05s",
            memory: 10240,
            token: "",
          },
        ],
      });
    }, 1000);
  }, [testCases, activeTestCase]);

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

  if (phase === "connecting") {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Connecting to voice room...
          </h2>
          <p className="text-muted-foreground">
            Please allow microphone access when prompted
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
          <h2 className="text-xl font-semibold mb-2">Ending interview...</h2>
          <p className="text-muted-foreground">
            Generating your evaluation report
          </p>
        </div>
      </div>
    );
  }

  if (phase === "active" && interview) {
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
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Voice mode unavailable. Continuing with text chat.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Retry Connection
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <LiveKitProvider
          token={voiceEnabled ? liveKitToken : null}
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
            toastService.error(
              "Voice connection error. Falling back to text mode.",
            );
            setVoiceEnabled(false);
            setIsVoiceConnected(false);
          }}
        >
          {isVoiceConnected && (
            <DataChannelHandler
              onTranscript={handleVoiceTranscript}
              onTranscriptDelta={handleTranscriptDelta}
              onTypingStart={() => setTyping(true)}
              onTypingEnd={() => setTyping(false)}
            />
          )}

          <div className="flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden">
            <InterviewHeader
              interviewTime={interviewTime}
              voiceEnabled={voiceEnabled}
              voiceConnected={isVoiceConnected}
              onVoiceToggle={handleVoiceToggle}
              onEndInterview={handleEndInterview}
              isEnding={isLoading}
              problem={interview.problemSnapshot}
            />

            {voiceEnabled && isVoiceConnected && (
              <div className="px-4 py-2 border-b bg-muted/10 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Microphone:
                </span>
                <AudioLevelIndicator />
                <span className="text-xs text-muted-foreground ml-2">
                  Speak now - your voice is being transcribed
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
                  <InterviewChat
                    messages={messages}
                    inputText={inputText}
                    onInputChange={setInputText}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading || isTyping}
                    disabled={phase !== "active"}
                  />
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
      <div className="h-[calc(100vh-64px)] overflow-hidden">
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
