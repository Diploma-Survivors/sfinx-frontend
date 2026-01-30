import clientApi from '@/lib/apis/axios-client';
import { PaymentTransaction, SubscriptionPlan, SubscriptionFeature, Currency, PaymentStatus } from '@/types/payment';
import { ApiResponse } from '@/types/api';

export const PaymentService = {
    getSubscriptionPlans: async (lang?: string): Promise<SubscriptionPlan[]> => {
        const response = await clientApi.get<ApiResponse<SubscriptionPlan[]>>('/subscription-plans', {
            params: { lang }
        });
        return response.data.data;
    },

    getSubscriptionFeatures: async (lang?: string): Promise<SubscriptionFeature[]> => {
        const response = await clientApi.get<ApiResponse<SubscriptionFeature[]>>('/subscription-features', {
            params: { lang }
        });
        return response.data.data;
    },

    createPayment: async (planId: number, bankCode: string = 'NCB'): Promise<string> => {
        const response = await clientApi.post<ApiResponse<{ url: string }>>('/payments/create', { planId, bankCode });
        return response.data.data.url;
    },


    async getPaymentHistory(): Promise<PaymentTransaction[]> {
        // Mock data for now as BE API is not ready
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        userId: 1,
                        planId: 3,
                        amount: 299.00,
                        amountVnd: 7500000,
                        currency: Currency.USD,
                        status: PaymentStatus.SUCCESS,
                        paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                        description: 'Annual Premium Subscription',
                        plan: {
                            id: 3,
                            name: 'Pro Yearly',
                            description: 'Best value for serious learners',
                            priceUsd: 299,
                            durationMonths: 12,
                            isActive: true,
                            features: [
                                { id: 1, key: 'unlimited_submissions', name: 'Unlimited Submissions', description: 'Submit code without daily limits', isActive: true },
                                { id: 2, key: 'ai_analysis', name: 'AI Analysis', description: 'Get detailed AI code analysis', isActive: true },
                                { id: 3, key: 'premium_problems', name: 'Premium Problems', description: 'Access to exclusive premium problems', isActive: true }
                            ],
                            type: 'YEARLY'
                        }
                    },
                    {
                        id: 2,
                        userId: 1,
                        planId: 2,
                        amount: 29.00,
                        amountVnd: 725000,
                        currency: Currency.USD,
                        status: PaymentStatus.SUCCESS,
                        paymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), // 35 days ago
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
                        description: 'Monthly Premium Subscription',
                        plan: {
                            id: 2,
                            name: 'Pro Monthly',
                            description: 'Flexible monthly billing',
                            priceUsd: 29,
                            durationMonths: 1,
                            isActive: true,
                            features: [
                                { id: 1, key: 'unlimited_submissions', name: 'Unlimited Submissions', description: 'Submit code without daily limits', isActive: true },
                                { id: 2, key: 'ai_analysis', name: 'AI Analysis', description: 'Get detailed AI code analysis', isActive: true }
                            ],
                            type: 'MONTHLY'
                        }
                    }
                ]);
            }, 500);
        });
    }
};
