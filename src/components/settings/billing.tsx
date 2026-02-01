'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

import { PaymentService } from '@/services/payments-service';
import { PaymentTransaction, PaymentStatus, CurrentPlan } from '@/types/payment';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toastService } from '@/services/toasts-service';

export function BillingSettings() {
    const { t } = useTranslation('profile');
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [planData, historyData] = await Promise.all([
                    PaymentService.getCurrentPlan(),
                    PaymentService.getPaymentHistory()
                ]);

                setCurrentPlan(planData);
                setTransactions(historyData);
            } catch (error) {
                toastService.error("Failed to fetch billing data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <CardTitle>{t('subscription_plan', { defaultValue: 'Subscription Plan' })}</CardTitle>
                    <CardDescription>{t('manage_subscription', { defaultValue: 'Manage your subscription details.' })}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="text-lg font-semibold text-foreground">
                            {currentPlan ? currentPlan.name : t('free_plan', { defaultValue: 'Free Plan' })}
                        </div>
                        {currentPlan && currentPlan.status === 'ACTIVE' ? (
                            <div className="mt-1 space-y-1">
                                <p className="text-sm text-green-600 font-medium">
                                    {t('premium_active_until', { defaultValue: 'Active until' })} {formatDate(currentPlan.expiresAt)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {currentPlan.daysRemaining} {t('days_remaining', { defaultValue: 'days remaining' })}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">{t('upgrade_to_unlock', { defaultValue: 'Upgrade to unlock premium features.' })}</p>
                        )}
                    </div>
                    <Link href="/pricing">
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                            {currentPlan ? t('extend_plan', { defaultValue: 'Extend Plan' }) : t('upgrade_plan', { defaultValue: 'Upgrade Plan' })}
                        </Button>
                    </Link>
                </CardContent>
            </Card>


            {/* Payment History */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <CardTitle>{t('billing_info', { defaultValue: 'Billing Information' })}</CardTitle>
                    <CardDescription>{t('billing_info_desc', { defaultValue: 'View your billing status.' })}</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.filter(t => t.status === PaymentStatus.SUCCESS).length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('date', { defaultValue: 'Date' })}</TableHead>
                                        <TableHead>{t('description', { defaultValue: 'Description' })}</TableHead>
                                        <TableHead>{t('amount', { defaultValue: 'Amount' })}</TableHead>
                                        <TableHead>{t('status', { defaultValue: 'Status' })}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions
                                        .filter(transaction => transaction.status === PaymentStatus.SUCCESS)
                                        .map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {formatDate(transaction.paymentDate || transaction.createdAt)}
                                                </TableCell>
                                                <TableCell>{transaction.description || transaction.plan?.name}</TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200"
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                            <p>{t('no_billing_history', { defaultValue: 'No billing history available.' })}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
