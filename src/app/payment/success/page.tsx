'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Receipt, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

function PaymentSuccessContent() {
    const { t } = useTranslation('common');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-[-1] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] opacity-50 animate-pulse" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-lg z-10"
            >
                <Card className="border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                    <CardHeader className="flex flex-col items-center pt-10 pb-6 text-center space-y-4 relative">
                        {/* Animated Success Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring" as const,
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2
                            }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-green-400 to-green-600 shadow-lg shadow-green-500/30"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Check className="h-12 w-12 text-white stroke-[3px]" />
                            </motion.div>

                            {/* Pulse Rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-green-500/30"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-green-500/20"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, delay: 0.2 }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                {t('payment_success', { defaultValue: 'Payment Successful!' })}
                            </h1>
                            <p className="text-lg text-muted-foreground mx-auto max-w-xs">
                                {t('upgrade_complete_desc', { defaultValue: 'You are now a Premium member. Enjoy all the exclusive features!' })}
                            </p>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="space-y-6 pb-8">

                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 p-6 pt-0 bg-muted/10">
                        <motion.div variants={itemVariants} className="w-full space-y-3">
                            <Link href="/settings?tab=billing" className="w-full block">
                                <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-0.5" >
                                    <Receipt className="mr-2 h-5 w-5" />
                                    {t('view_billing_history', { defaultValue: 'View Billing & History' })}
                                </Button>
                            </Link>

                            <Link href="/dashboard" className="w-full block">
                                <Button variant="outline" size="lg" className="w-full border-border/50 hover:bg-muted/50 transition-all duration-300">
                                    <LayoutDashboard className="mr-2 h-5 w-5 text-muted-foreground" />
                                    {t('return_dashboard', { defaultValue: 'Return to Dashboard' })}
                                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </Link>
                        </motion.div>
                    </CardFooter>
                </Card>

                <motion.p
                    variants={itemVariants}
                    className="mt-6 text-center text-sm text-muted-foreground opacity-60"
                >
                    {t('auto_redirect_hint', { defaultValue: 'Check your email for the receipt.' })}
                </motion.p>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
