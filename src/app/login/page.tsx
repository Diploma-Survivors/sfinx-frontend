"use client";

import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2, BrainCircuit } from "lucide-react";
import Image from "next/image";
import clientApi from "@/lib/apis/axios-client";
import { toastService } from "@/services/toasts-service";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/problems";

  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const finalUsername = (formData.get("username") as string) || username;
    const finalPassword = (formData.get("password") as string) || password;

    if (isSignUp) {
      if (password !== confirmPassword) {
        toastService.error(t("passwords_do_not_match"));
        setIsLoading(false);
        return;
      }

      try {
        await clientApi.post("/auth/register", {
          email,
          username,
          password,
          fullName,
        });
        toastService.success(t("registration_successful"));

        // Auto login after successful registration
        const result = await signIn("credentials", {
          username: finalUsername,
          password: finalPassword,
          redirect: true,
          callbackUrl,
        });

        if (result?.error) {
          toastService.error(result.error);
        }
      } catch (error: any) {
        toastService.error(
          error.response?.data?.message || t("registration_failed"),
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      const result = await signIn("credentials", {
        username: finalUsername,
        password: finalPassword,
        redirect: true,
        callbackUrl,
      });

      if (result?.error) {
        toastService.error(result.error);
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    }
  };

  const handleGoogleLogin = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen w-full flex bg-black relative overflow-hidden">
      {/* Deep, immersive background image spanning full width */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/ai-texture.jpg"
          alt="AI Texture Background"
          fill
          className="object-cover object-center opacity-40 lg:opacity-60 mix-blend-screen scale-105 animate-[gradient_20s_ease-in-out_infinite_alternate]"
          priority
        />
        <div className="absolute inset-0 bg-background/50 lg:bg-background/20 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent hidden lg:block"></div>
      </div>

      <div className="relative z-10 flex w-full h-full min-h-screen container mx-auto p-0">
        {/* Left Column: Storytelling/Hero Area (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative flex-col justify-end p-12 overflow-hidden text-left">
          {/* Narrative Content */}
          <div className="max-w-lg mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 dark:bg-white/10 backdrop-blur-md border border-border dark:border-white/20 text-foreground dark:text-white text-sm mb-6">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground dark:text-white tracking-tight mb-4 text-balance leading-[1.1]">
              {t("hero.title_pt1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-[oklch(0.55_0.18_160)]">
                {t("hero.title_pt2")}
              </span>
            </h1>
            <p className="text-muted-foreground dark:text-white/70 text-lg leading-relaxed text-balance">
              {t("hero.description")}
            </p>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="relative w-10 h-10 rounded-full border-2 border-background dark:border-black overflow-hidden bg-muted dark:bg-muted/80 backdrop-blur-sm"
                  >
                    <Image
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? "men" : "women"}/${i + 32}.jpg`}
                      alt="User Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-foreground/80 dark:text-white/80">
                <span className="font-bold text-foreground dark:text-white">
                  4,000+
                </span>{" "}
                {t("hero.social_proof")}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Area (Narrower to let image shine) */}
        <div className="w-full lg:w-[480px] xl:w-[500px] shrink-0 flex items-center justify-center p-6 sm:p-12 relative">
          {/* Animated Orbs behind form */}
          <div className="absolute top-[10%] left-[-20%] w-[40vw] h-[40vw] lg:w-96 lg:h-96 rounded-full bg-primary/20 blur-[100px] mix-blend-screen opacity-50 animate-pulse-ring pointer-events-none"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[30vw] h-[30vw] lg:w-72 lg:h-72 rounded-full bg-primary/10 blur-[80px] mix-blend-screen opacity-40 animate-float pointer-events-none"></div>

          <div className="w-full max-w-md relative">
            <div className="p-8 sm:p-10 rounded-[2rem] bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-primary/5 transition-all duration-300">
              {/* Header */}
              <div className="text-center mb-10 space-y-3">
                <div className="inline-flex lg:hidden items-center justify-center p-3 mb-2 rounded-2xl bg-primary/10 border border-primary/20">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {t("welcome_back")}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isSignUp ? t("create_account_desc") : t("enter_login_info")}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Input
                        id="email"
                        name="email"
                        placeholder={t("email")}
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-border/40 focus-visible:ring-primary focus-visible:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder={t("full_name")}
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-border/40 focus-visible:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    id="username"
                    name="username"
                    placeholder={t("username")}
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-border/40 focus-visible:ring-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder={t("password")}
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-border/40 focus-visible:ring-primary transition-colors [&>button]:right-4"
                  />
                </div>

                {!isSignUp && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordModalOpen(true)}
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t("forgot_password")}?
                    </button>
                  </div>
                )}

                {isSignUp && (
                  <div className="space-y-2">
                    <PasswordInput
                      id="confirm-password"
                      name="confirmPassword"
                      placeholder={t("confirm_password")}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-border/40 focus-visible:ring-primary transition-colors [&>button]:right-4"
                    />
                  </div>
                )}

                <Button
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden mt-2"
                  type="submit"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSignUp ? (
                      t("sign_up")
                    ) : (
                      t("sign_in")
                    )}
                  </span>
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/80 dark:bg-[#1a1c1e] px-3 font-medium text-muted-foreground rounded-full backdrop-blur-xl border border-border/40">
                    {t("or_login_with")}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleGoogleLogin()}
                variant="outline"
                className="w-full h-12 rounded-xl border-border/60 hover:bg-muted/50 bg-white/30 dark:bg-black/30 backdrop-blur-sm transition-all duration-200"
                type="button"
                disabled={isLoading}
              >
                <FcGoogle className="mr-3 h-5 w-5" />
                <span className="font-medium text-foreground/90">Google</span>
              </Button>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                {isSignUp ? t("already_have_account") : t("dont_have_account")}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-primary hover:underline underline-offset-4 transition-all"
                  disabled={isLoading}
                >
                  {isSignUp ? t("sign_in") : t("sign_up")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}
