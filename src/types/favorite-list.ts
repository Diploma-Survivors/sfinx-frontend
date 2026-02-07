import { Problem } from './problems';

export interface FavoriteList {
    id: number;
    name: string;
    description?: string;
    icon: string;
    isPublic: boolean;
    isDefault: boolean;
    userId: number;
    createdAt: string;
    updatedAt: string;
    problems?: Problem[];
}

export interface CreateFavoriteListDto {
    name: string;
    description?: string;
    isPublic?: boolean;
    icon?: string;
}

export interface UpdateFavoriteListDto {
    name?: string;
    description?: string;
    isPublic?: boolean;
    icon?: string;
}
