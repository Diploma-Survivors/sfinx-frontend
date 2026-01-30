export enum Currency {
    USD = 'USD',
    VND = 'VND',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export interface SubscriptionFeature {
    id: number;
    key: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    priceUsd: number;
    durationMonths: number;
    isActive: boolean;
    features: SubscriptionFeature[]; // Array of feature objects
    type: string; // 'FREE', 'PREMIUM', 'MONTHLY', 'YEARLY'
}

export interface PaymentTransaction {
    id: number;
    userId: number;
    planId: number;
    amount: number;
    amountVnd: number;
    currency: Currency;
    status: PaymentStatus;
    paymentDate?: string; // ISO Datev
    description?: string;
    plan?: SubscriptionPlan;
    createdAt: string;
}

export interface CreatePaymentResponse {
    url: string;
}
