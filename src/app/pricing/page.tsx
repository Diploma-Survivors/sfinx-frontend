"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Zap,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentService } from "@/services/payments-service";
import type { SubscriptionPlan } from "@/types/payment";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { toastService } from "@/services/toasts-service";
import { useApp } from "@/contexts/app-context";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PaymentMethodDialog } from "@/components/payments/payment-method-dialog";

export default function PricingPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { isPrenium, user } = useApp(); // Note: Context uses 'isPrenium' typo
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        // Fetch both plans and features in parallel
        const [plansData, featuresData] = await Promise.all([
          PaymentService.getSubscriptionPlans(i18n.language),
          PaymentService.getSubscriptionFeatures(i18n.language),
        ]);

        // Transform features to extract name and description from translations
        const transformedFeatures = featuresData.map((feature) => {
          const translation = (feature as any).translations?.[0];
          return {
            id: feature.id,
            key: feature.key,
            name: translation?.name || feature.key,
            description: translation?.description,
            isActive: feature.isActive,
          };
        });

        // Create free plan with hardcoded features
        const freePlan: SubscriptionPlan = {
          id: 0,
          name: t("free"),
          description: t("free_plan_desc"),
          priceUsd: 0,
          durationMonths: 0,
          isActive: true,
          features: [
            {
              id: 0,
              key: "unlimited_practice",
              name: t("feature_unlimited_practice"),
              isActive: true,
            },
            {
              id: 0,
              key: "basic_eval",
              name: t("feature_basic_eval"),
              isActive: true,
            },
            {
              id: 0,
              key: "community",
              name: t("feature_community"),
              isActive: true,
            },
            {
              id: 0,
              key: "limited_metrics",
              name: t("feature_limited_metrics"),
              isActive: true,
            },
          ],
          type: "FREE",
        };

        // Assign all features to premium plans (MONTHLY and YEARLY)
        const plansWithFeatures = plansData.map((plan) => {
          // If plan is premium (MONTHLY or YEARLY), assign all features
          if (plan.type === "MONTHLY" || plan.type === "YEARLY") {
            return {
              ...plan,
              features: transformedFeatures,
            };
          }
          return plan;
        });

        setPlans([freePlan, ...plansWithFeatures]);
      } catch (error) {
        console.error("Failed to load plans", error);
        toastService.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [i18n.language, t]);

  const handleSubscribe = (planId: number) => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setSelectedPlanId(planId);
    setDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentMethod: number) => {
    if (!selectedPlanId) return;

    setProcessingId(selectedPlanId);
    try {
      const redirectUrl = await PaymentService.createPayment(
        selectedPlanId,
        paymentMethod
      );
      setDialogOpen(false);
      router.push(redirectUrl);
    } catch {
      toastService.error("Failed to initiate payment. Please try again.");
      setProcessingId(null);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background to-background/50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-16 space-y-4">
            <Skeleton
              width={150}
              height={32}
              borderRadius={99}
              className="mx-auto"
            />
            <Skeleton
              width={600}
              height={48}
              borderRadius={8}
              className="mx-auto"
            />
            <Skeleton
              width={400}
              height={24}
              borderRadius={8}
              className="mx-auto"
            />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg"
              >
                <CardHeader className="pb-4 space-y-2">
                  <Skeleton width={32} height={32} borderRadius={12} />
                  <Skeleton width="50%" height={32} />
                  <Skeleton width="100%" height={16} count={2} />
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <Skeleton width="33%" height={48} />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton circle width={16} height={16} />
                        <Skeleton width="90%" height={16} />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Skeleton height={56} borderRadius={6} width="100%" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background to-background/50 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-4">
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              {t("premium_access", { defaultValue: "Premium Access" })}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
              {t("pricing_simple", { defaultValue: "Simple, " })}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                {t("pricing_transparent", { defaultValue: "Transparent" })}
              </span>
              {t("pricing_pricing", { defaultValue: " Pricing" })}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t("pricing_subtitle", {
                defaultValue:
                  "Unlock your full potential with our premium features. Choose the plan that fits your journey.",
              })}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
          >
            {plans.map((plan) => {
              const isPremiumPlan = plan.priceUsd > 0;
              const isPopular = plan.id === 3 || plan.durationMonths === 12; // Check duration for language independence
              const isCurrentPlan = isPrenium && isPremiumPlan; // Simplified logic: if user is premium, all premium plans show as active/owned contextually

              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className="flex"
                >
                  <Card
                    className={cn(
                      "relative flex w-full flex-col overflow-hidden transition-all duration-300",
                      isPopular
                        ? "border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10"
                        : "border-border/50 shadow-lg hover:shadow-xl hover:translate-y-[-4px]",
                      "bg-background/60 backdrop-blur-xl",
                    )}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gradient-to-l from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                          {t("most_popular", { defaultValue: "Most Popular" })}
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            isPremiumPlan
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isPremiumPlan ? (
                            <Sparkles className="h-6 w-6" />
                          ) : (
                            <ShieldCheck className="h-6 w-6" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight text-foreground">
                          ${plan.priceUsd}
                        </span>
                        <span className="ml-1 text-sm font-medium text-muted-foreground">
                          /
                          {plan.durationMonths === 1
                            ? t("duration_month", { defaultValue: "month" })
                            : plan.durationMonths === 12
                              ? t("duration_year", { defaultValue: "year" })
                              : t("duration_forever", {
                                defaultValue: "forever",
                              })}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {plan.features?.map((feature, index) => (
                          <div
                            key={feature.id || index}
                            className="flex items-start group"
                          >
                            <div
                              className={cn(
                                "flex-shrink-0 mt-0.5 rounded-full p-0.5",
                                isPremiumPlan
                                  ? "text-green-500 bg-green-500/10"
                                  : "text-muted-foreground bg-muted",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                                {feature.name}
                              </span>
                              {feature.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {feature.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-6">
                      {isPremiumPlan ? (
                        <Button
                          className={cn(
                            "w-full text-base font-semibold py-6 shadow-lg transition-all",
                            !isPrenium
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/25"
                              : "text-green-600 border-green-200 bg-green-50 disabled:opacity-100",
                          )}
                          variant={!isPrenium ? "default" : "outline"}
                          disabled={!!processingId || isPrenium}
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          {processingId === plan.id ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : isPrenium ? (
                            <>
                              <Check className="mr-2 h-5 w-5" />
                              {t("plan_active", { defaultValue: "Plan Active" })}
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              {t("subscribe_now", {
                                defaultValue: "Upgrade Now",
                              })}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-base font-semibold py-6"
                          variant="secondary"
                          disabled
                        >
                          {t("free_forever", { defaultValue: "Free Forever" })}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {t("secure_payment_notice", {
                defaultValue: "Payments are processed securely via VNPAY.",
              })}
              <br />
              {isPrenium && (
                <span className="text-primary font-medium mt-2 block">
                  {t("currently_premium", {
                    defaultValue: "You are currently a Premium member.",
                  })}
                  <span
                    className="underline cursor-pointer ml-1 hover:text-primary/80"
                    onClick={() => router.push("/settings?tab=billing")}
                  >
                    {t("manage_subscription", {
                      defaultValue: "Manage Subscription",
                    })}
                  </span>
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      <PaymentMethodDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setProcessingId(null);
        }}
        onConfirm={handlePaymentConfirm}
        loading={!!processingId}
        lang={i18n.language}
      />
    </>
  );
}
