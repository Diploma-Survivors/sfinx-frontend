import clientApi from '@/lib/apis/axios-client';
import { FavoriteList } from '@/types/favorite-list';

import { ApiResponse } from '@/types/api';

export const favoriteListService = {
    getAll: async () => {
        const response = await clientApi.get<ApiResponse<FavoriteList[]>>('/favorite-lists');
        return response.data.data;
    },

    create: async (data: {
        name: string;
        description?: string;
        isPublic: boolean;
        icon?: string;
    }) => {
        const response = await clientApi.post<ApiResponse<FavoriteList>>(
            '/favorite-lists',
            data
        );
        return response.data.data;
    },

    update: async (
        id: number,
        data: {
            name?: string;
            description?: string;
            isPublic?: boolean;
            icon?: string;
        }
    ) => {
        const response = await clientApi.patch<ApiResponse<FavoriteList>>(
            `/favorite-lists/${id}`,
            data
        );
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await clientApi.get<ApiResponse<FavoriteList>>(`/favorite-lists/${id}`);
        return response.data.data;
    },

    delete: async (id: number) => {
        await clientApi.delete(`/favorite-lists/${id}`);
    },

    addProblem: async (listId: number, problemId: number) => {
        const response = await clientApi.post<ApiResponse<FavoriteList>>(
            `/favorite-lists/${listId}/problems/${problemId}`
        );
        return response.data.data;
    },

    removeProblem: async (listId: number, problemId: number) => {
        const response = await clientApi.delete<ApiResponse<FavoriteList>>(
            `/favorite-lists/${listId}/problems/${problemId}`
        );
        return response.data.data;
    },

    getPublicLists: async (limit = 10, sort: 'newest' | 'trending' = 'newest') => {
        const response = await clientApi.get<ApiResponse<FavoriteList[]>>('/favorite-lists/public', {
            params: { limit, sort },
        });
        return response.data.data;
    },

    getProblems: async (listId: number) => {
        const response = await clientApi.get<ApiResponse<any>>(`/favorite-lists/${listId}/problems`);
        return response.data.data;
    },

    uploadIcon: async (listId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await clientApi.post<ApiResponse<FavoriteList>>(
            `/favorite-lists/${listId}/icon`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    save: async (id: number) => {
        await clientApi.post(`/favorite-lists/${id}/save`);
    },

    unsave: async (id: number) => {
        await clientApi.delete(`/favorite-lists/${id}/save`);
    },

    getSavedLists: async () => {
        const response = await clientApi.get<ApiResponse<FavoriteList[]>>('/favorite-lists/saved/me');
        return response.data.data;
    },
};
