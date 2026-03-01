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

export interface CurrentPlan {
    planId: number;
    name: string;
    description: string;
    price: string;
    type: string; // 'MONTHLY', 'YEARLY', etc.
    startDate: string;
    expiresAt: string;
    daysRemaining: number;
    status: string; // 'ACTIVE', 'EXPIRED', etc.
}

export interface PaymentMethodInfo {
    id: number;
    method: number;
    name: string;
    description: string | null;
    iconUrl: string | null;
    isActive: boolean;
}
