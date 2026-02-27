import type { Problem } from "./problems";

export interface FavoriteList {
  id: number;
  name: string;
  description?: string;
  icon: string;
  isPublic: boolean;
  isDefault: boolean;
  userId: number;
  user?: {
    id: number;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  problems?: Problem[];
  savedCount: number;
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
