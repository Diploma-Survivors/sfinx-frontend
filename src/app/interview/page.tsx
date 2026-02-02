'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { InterviewGreeting } from '@/components/interview/interview-greeting';
import { InterviewHeader } from '@/components/interview/interview-header';
import {
  InterviewChat,
  type Message,
} from '@/components/interview/interview-chat';
import { InterviewFeedback } from '@/components/interview/interview-feedback';
import { EditorPanel } from '@/components/problems/tabs/description/panels/editor-panel/editor-panel';
import { SampleTestCasesPanel } from '@/components/problems/tabs/description/panels/sample-testcases-panel/sample-testcases-panel';
import { ResizableDivider } from '@/components/problems/tabs/description/dividers/resizable-divider';
import type { SampleTestCase } from '@/types/testcases';
import type { SSEResult } from '@/services/sse-service';

type InterviewPhase = 'greeting' | 'active' | 'feedback';

export default function LiveInterviewPage() {
  const { t } = useTranslation('interview');
  const [phase, setPhase] = useState<InterviewPhase>('greeting');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'interviewer',
      text: "Hello! I'm excited to talk with you today. We'll be working through a coding problem together. Feel free to think out loud and ask questions. Let's start with an easy problem to warm up.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [interviewTime, setInterviewTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<SSEResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testCases, setTestCases] = useState<SampleTestCase[]>([
    { id: 1, input: '[1, 5, 2, -3, 7]', expectedOutput: '35' },
    { id: 2, input: '[-1, -2, -3, -4]', expectedOutput: '12' },
  ]);

  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [isHD, setIsHD] = useState(false);
  const [isVD, setIsVD] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'active') return;
    const timer = setInterval(() => setInterviewTime((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

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

  const handleStartInterview = () => {
    setPhase('active');
    setMessages([
      {
        id: '1',
        sender: 'interviewer',
        text: "Perfect! Let's get started. Here's your first problem:\n\nGiven an array of integers, find the maximum product of any two elements.",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'candidate',
      text: inputText,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, newMsg]);
    setInputText('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          sender: 'interviewer',
          text: 'Great approach! Can you walk me through your logic?',
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setRunError(null);
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
            stdout: '35',
            expectedOutput: testCases[activeTestCase]?.expectedOutput || '',
            status: 'Accepted',
            time: '0.05s',
            memory: 10240,
            token: '',
          },
        ],
      });
    }, 1000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPhase('feedback');
    }, 1500);
  };

  const handleTestCaseAdd = () => {
    const maxId = testCases.reduce(
      (max, t) => ((t.id ?? 0) > max ? (t.id ?? 0) : max),
      0
    );
    const newId = maxId + 1;
    setTestCases([...testCases, { id: newId, input: '', expectedOutput: '' }]);
    setActiveTestCase(testCases.length);
  };

  const handleTestCaseDelete = (id: number) => {
    if (testCases.length <= 1) return;
    const filtered = testCases.filter((t) => t.id !== id);
    setTestCases(filtered);
    const newIndex = Math.min(activeTestCase, filtered.length - 1);
    setActiveTestCase(newIndex < 0 ? 0 : newIndex);
  };

  const handleTestCaseChange = (
    id: number,
    field: 'input' | 'expectedOutput',
    value: string
  ) => {
    setTestCases(
      testCases.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  if (phase === 'greeting') {
    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <InterviewGreeting
          voiceEnabled={voiceEnabled}
          onVoiceEnabledChange={setVoiceEnabled}
          onStartInterview={handleStartInterview}
        />
      </div>
    );
  }

  if (phase === 'active') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background overflow-hidden">
        <InterviewHeader
          interviewTime={interviewTime}
          voiceEnabled={voiceEnabled}
          onVoiceToggle={() => setVoiceEnabled(!voiceEnabled)}
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
              <InterviewChat
                messages={messages}
                inputText={inputText}
                onInputChange={setInputText}
                onSendMessage={handleSendMessage}
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
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <InterviewFeedback
        interviewTime={interviewTime}
        onStartNew={() => setPhase('greeting')}
      />
    </div>
  );
}
