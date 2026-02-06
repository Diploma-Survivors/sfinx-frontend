export interface Author {
    id: number;
    username: string;
    fullName: string | null;
    avatarKey: string | null;
    avatarUrl?: string; // Comments return pre-signed URL/full URL
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface Comment {
    id: number;
    parentId: number | null;
    content: string;
    author: Author;
    createdAt: string;
    updatedAt: string;
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    isDeleted: boolean;
    isEdited: boolean;
    userVote: number | null; // 1 for UPVOTE, -1 for DOWNVOTE (if using enum values)
    replies?: Comment[];
}

export interface Post {
    id: string;
    title: string;
    content: string;
    slug: string;
    viewCount: number;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    isLocked: boolean;
    isDeleted: boolean;
    author: Author;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CreatePostDto {
    title: string;
    content: string;
    tags?: Tag[];
}

export interface UpdatePostDto {
    title?: string;
    content?: string;
    tags?: Tag[];
}

export interface FilterPostDto {
    page?: number;
    limit?: number;
    search?: string;
    tagIds?: number[];
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface FilterTagDto {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
}
