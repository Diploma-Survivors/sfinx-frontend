"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Code2,
  Loader2,
  MessageSquare,
  Mic,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface InterviewGreetingProps {
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onStartInterview: () => void;
  isLoading?: boolean;
}

export function InterviewGreeting({
  voiceEnabled,
  onVoiceEnabledChange,
  onStartInterview,
  isLoading = false,
}: InterviewGreetingProps) {
  const { t } = useTranslation("interview");

  const steps = [
    { icon: Code2, key: "solve" },
    { icon: MessageSquare, key: "explain" },
    { icon: Mic, key: "feedback" },
    { icon: Trophy, key: "scores" },
  ];

  return (
    <div className="h-full w-full relative flex items-center justify-center p-4 md:p-8 bg-background overflow-hidden">
      {/* Background Texture & Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse-ring opacity-60"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] mix-blend-screen animate-float opacity-50"></div>
        <div
          className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px] mix-blend-screen opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between">
        {/* Left Column: Title & Features */}
        <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-balance leading-tight">
            <span className="bg-gradient-to-br from-primary via-primary/80 to-[oklch(0.55_0.18_160)] bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-md text-balance">
            {t("subtitle")} {t("greeting.experience_natural_ai")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-border/40 hover:bg-white/60 dark:hover:bg-black/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(`steps.${step.key}`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`steps.${step.key}_desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="w-full max-w-md flex flex-col shrink-0">
          <Card className="w-full p-8 flex flex-col gap-6 bg-white/70 dark:bg-black/50 backdrop-blur-2xl border-border/40 shadow-2xl shadow-primary/5 rounded-[2rem] relative overflow-hidden">
            {/* Card inner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("greeting.ready_to_begin")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("greeting.configure_env")}
              </p>
            </div>

            {/* Random Problem Notice */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Trophy className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {t("greeting.random_problem_selection")}
                </p>
                <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  {t("greeting.random_problem_desc")}{" "}
                  {t("greeting.challenge_curated_desc")}
                </p>
              </div>
            </div>

            <button
              onClick={() => onVoiceEnabledChange(!voiceEnabled)}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-5 rounded-2xl border border-border/40 hover:bg-white/50 dark:hover:bg-black/30 transition-all duration-300 disabled:opacity-50 group cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${voiceEnabled ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "bg-muted border-transparent group-hover:bg-muted/80"} border`}
                >
                  <Volume2
                    className={`w-6 h-6 transition-colors ${voiceEnabled ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t("voice.title")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("voice.description")}
                  </p>
                </div>
              </div>
              <div
                className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 shrink-0 shadow-inner relative z-10 ${voiceEnabled ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]" : "bg-muted-foreground/20"}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${voiceEnabled ? "translate-x-7" : "translate-x-0"}`}
                />
              </div>
            </button>

            <Button
              onClick={onStartInterview}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 mt-2 relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    {t("greeting.starting")}
                  </>
                ) : (
                  <>
                    {t("start")}
                    <span className="ml-2 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all">
                      →
                    </span>
                  </>
                )}
              </span>
            </Button>
          </Card>

          <div className="flex items-center justify-center gap-2 mt-8 text-xs font-medium text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
              ⏱ {t("duration")}
            </span>
            <span className="px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
              🌿 {t("noPressure")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state for when we're fetching a random problem
 */
export function InterviewGreetingSkeleton() {
  return (
    <div className="h-full w-full relative flex items-center justify-center p-4 md:p-8 bg-background overflow-hidden">
      {/* Background Texture & Gradient Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-muted/20 blur-[120px] mix-blend-screen opacity-60"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-muted/10 blur-[100px] mix-blend-screen opacity-50"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-between">
        {/* Left Column Skeleton */}
        <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
          <div className="h-14 w-14 bg-muted/60 rounded-2xl mb-6 flex-shrink-0 animate-pulse backdrop-blur-xl border border-border/20" />
          <div className="h-10 sm:h-12 w-[80%] max-w-[400px] bg-muted/60 rounded-xl mb-4 animate-pulse backdrop-blur-xl border border-border/20" />
          <div className="h-6 w-[60%] max-w-[300px] bg-muted/60 rounded-lg mb-10 animate-pulse backdrop-blur-xl border border-border/20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/20 dark:bg-black/10 backdrop-blur-md border border-border/20 h-[88px]"
              >
                <div className="w-12 h-12 rounded-xl bg-muted/60 flex-shrink-0 animate-pulse" />
                <div className="space-y-2 w-full pt-1">
                  <div className="h-4 w-24 bg-muted/60 rounded-md animate-pulse" />
                  <div className="h-3 w-[80%] bg-muted/60 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="w-full max-w-md flex flex-col shrink-0">
          <Card className="w-full p-8 flex flex-col gap-6 bg-white/40 dark:bg-black/30 backdrop-blur-2xl border-border/20 shadow-xl rounded-[2rem]">
            <div className="space-y-3">
              <div className="h-8 w-40 bg-muted/60 rounded-lg animate-pulse" />
              <div className="h-4 w-56 bg-muted/60 rounded-md animate-pulse" />
            </div>

            <div className="h-[92px] w-full bg-muted/60 rounded-2xl animate-pulse backdrop-blur-xl border border-border/20" />
            <div className="h-[92px] w-full bg-muted/60 rounded-2xl animate-pulse backdrop-blur-xl border border-border/20" />
            <div className="h-14 w-full bg-muted/60 rounded-2xl animate-pulse backdrop-blur-xl mt-2 border border-border/20" />
          </Card>

          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-6 w-24 bg-muted/60 rounded-full animate-pulse backdrop-blur-sm border border-border/20" />
            <div className="h-6 w-24 bg-muted/60 rounded-full animate-pulse backdrop-blur-sm border border-border/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
