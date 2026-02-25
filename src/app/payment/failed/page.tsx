"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import Link from "next/link";

function PaymentFailedContent() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  // Animation variants matching success page
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
      {/* Background Decorations (Red Theme) */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] opacity-50 animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg z-10"
      >
        <Card className="border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <CardHeader className="flex flex-col items-center pt-10 pb-6 text-center space-y-4 relative">
            {/* Animated Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring" as const,
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-red-500 to-red-700 shadow-lg shadow-red-500/30"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AlertTriangle className="h-12 w-12 text-white stroke-[3px]" />
              </motion.div>

              {/* Pulse Rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500/20"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                  delay: 0.2,
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("payment_failed", { defaultValue: "Payment Failed" })}
              </h1>
              <p className="text-lg text-muted-foreground mx-auto max-w-xs">
                {t("payment_failed_desc", {
                  defaultValue:
                    "We could not process your payment. Please try again or contact support.",
                })}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 pb-6">
            {message && (
              <motion.div
                variants={itemVariants}
                className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-center"
              >
                <p className="text-sm font-medium text-red-600 dark:text-red-400 break-words">
                  {decodeURIComponent(message)}
                </p>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-6 pt-0 bg-muted/10">
            <motion.div variants={itemVariants} className="w-full space-y-3">
              <Link href="/pricing" className="w-full block">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <RefreshCcw className="mr-2 h-5 w-5" />
                  {t("try_again", { defaultValue: "Try Again" })}
                </Button>
              </Link>

              <Link href="/settings?tab=billing" className="w-full block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border/50 hover:bg-muted/50 transition-all duration-300"
                >
                  <Settings className="mr-2 h-5 w-5 text-muted-foreground" />
                  {t("return_settings", { defaultValue: "Return to Settings" })}
                </Button>
              </Link>
            </motion.div>
          </CardFooter>
        </Card>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-sm text-muted-foreground opacity-60"
        >
          {t("support_hint", {
            defaultValue: "Need help? Contact our support team.",
          })}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
