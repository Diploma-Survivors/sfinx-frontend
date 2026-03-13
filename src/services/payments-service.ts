import clientApi from '@/lib/apis/axios-client';
import { PaymentTransaction, SubscriptionPlan, SubscriptionFeature, CurrentPlan, PaymentMethodInfo } from '@/types/payment';
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

    getPaymentMethods: async (lang?: string): Promise<PaymentMethodInfo[]> => {
        const response = await clientApi.get<ApiResponse<PaymentMethodInfo[]>>('/payments/methods', {
            params: { lang }
        });
        return response.data.data;
    },

    createPayment: async (planId: number, paymentMethod?: number): Promise<string> => {
        const response = await clientApi.post<ApiResponse<{ url: string }>>('/payments/create', { planId, paymentMethod });
        return response.data.data.url;
    },


    async getPaymentHistory(): Promise<PaymentTransaction[]> {
        const response = await clientApi.get<ApiResponse<PaymentTransaction[]>>('/payments/history');
        return response.data.data;
    },

    async getCurrentPlan(): Promise<CurrentPlan | null> {
        try {
            const response = await clientApi.get<ApiResponse<CurrentPlan>>('/payments/current-plan');
            return response.data.data;
        } catch (error) {
            // Return null if no active plan (e.g., 404 or other error)
            return null;
        }
    }
};
