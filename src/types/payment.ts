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
    basePrice: number; // Base price in VND (before fees)
    prices: Record<string, number>; // Final price per currency (fees included)
    durationMonths: number;
    isActive: boolean;
    features: SubscriptionFeature[]; // Array of feature objects
    type: string; // 'FREE', 'PREMIUM', 'MONTHLY', 'YEARLY'
}

export interface PaymentTransaction {
    id: number;
    amount: number;
    currency: Currency;
    provider: string;
    status: PaymentStatus;
    planName: string;
    paymentDate: string;
    transactionId: string;
}

export interface CreatePaymentResponse {
    url: string;
}

export interface CurrentPlan {
    planId: number;
    name: string;
    description: string;
    basePrice: number;
    prices: Record<string, number>;
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
