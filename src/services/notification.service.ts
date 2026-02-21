import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';

export enum NotificationType {
    SYSTEM = 'SYSTEM',
    COMMENT = 'COMMENT',
    REPLY = 'REPLY',
    CONTEST = 'CONTEST',
    MENTION = 'MENTION',
}

export interface Notification {
    id: string;
    recipientId: number;
    senderId?: number | null;
    type: NotificationType;
    title: string;
    content: string;
    link?: string | null;
    isRead: boolean;
    metadata?: any | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedNotifications {
    data: Notification[];
    total: number;
    skip: number;
    take: number;
}

export const notificationService = {
    getNotifications: async (skip = 0, take = 20) => {
        const response = await clientApi.get<ApiResponse<PaginatedNotifications>>('/notifications', { params: { skip, take } });
        return response.data.data;
    },

    getUnreadCount: async () => {
        const response = await clientApi.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
        return response.data.data;
    },

    markAsRead: async (id: string) => {
        const response = await clientApi.patch<ApiResponse<any>>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await clientApi.patch<ApiResponse<any>>('/notifications/read-all');
        return response.data;
    },
};
