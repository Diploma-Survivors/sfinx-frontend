import clientApi from '@/lib/apis/axios-client';
import type {
    Author,
    Comment,
    CreatePostDto,
    FilterPostDto,
    FilterTagDto,
    PaginatedResult,
    Post,
    Tag,
    UpdatePostDto,
} from '@/types/discuss';

export type {
    Author,
    Comment,
    CreatePostDto,
    FilterPostDto,
    FilterTagDto,
    PaginatedResult,
    Post,
    Tag,
    UpdatePostDto,
};

export class DiscussService {
    private static readonly BASE_URL = '/discuss';

    static async getTags(
        filters?: FilterTagDto
    ): Promise<PaginatedResult<Tag>> {
        const params = new URLSearchParams();

        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.isActive !== undefined) {
            params.append('isActive', filters.isActive.toString());
        }

        const response = await clientApi.get<{ data: PaginatedResult<Tag> }>(
            `${this.BASE_URL}/tags?${params.toString()}`
        );

        return response.data.data;
    }

    static async getPosts(
        filters?: FilterPostDto
    ): Promise<PaginatedResult<Post>> {
        const params = new URLSearchParams();

        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.tagIds) {
            filters.tagIds.forEach(id => params.append('tagIds', id.toString()));
        }

        const response = await clientApi.get<{ data: PaginatedResult<Post> }>(
            `${this.BASE_URL}?${params.toString()}`
        );

        return response.data.data;
    }

    static async getPost(idOrSlug: string): Promise<Post> {
        const response = await clientApi.get<{ data: Post }>(
            `${this.BASE_URL}/${idOrSlug}`
        );
        return response.data.data;
    }

    static async createPost(data: CreatePostDto): Promise<Post> {
        const payload = {
            title: data.title,
            content: data.content,
            tagIds: data.tags?.map(tag => tag.id),
        };

        const response = await clientApi.post<{ data: Post }>(
            this.BASE_URL,
            payload
        );
        return response.data.data;
    }

    static async updatePost(
        id: string,
        data: UpdatePostDto
    ): Promise<Post> {
        const payload = {
            ...(data.title && { title: data.title }),
            ...(data.content && { content: data.content }),
            ...(data.tags && { tagIds: data.tags.map(tag => tag.id) }),
        };

        const response = await clientApi.patch<{ data: Post }>(
            `${this.BASE_URL}/${id}`,
            payload
        );
        return response.data.data;
    }

    static async deletePost(id: string): Promise<void> {
        await clientApi.delete(`${this.BASE_URL}/${id}`);
    }

    // Legacy method for backward compatibility
    static async getPostById(id: string): Promise<Post | null> {
        try {
            return await this.getPost(id);
        } catch (error) {
            return null;
        }
    }

    private static readonly COMMENT_URL = '/discuss-comments';

    static async getComments(postId: string): Promise<Comment[]> {
        const response = await clientApi.get<{ data: Comment[] }>(
            `${this.COMMENT_URL}/${postId}`
        );
        return response.data.data;
    }

    static async getCommentsForPost(postId: string): Promise<Comment[]> {
        const response = await clientApi.get<{ data: Comment[] }>(
            `${this.COMMENT_URL}/${postId}`
        );
        return response.data.data || [];
    }

    static async createComment(postId: string, content: string, parentId?: number): Promise<Comment> {
        const payload = { content, parentId };
        const response = await clientApi.post<{ data: Comment }>(
            `${this.COMMENT_URL}/${postId}`,
            payload
        );
        return response.data.data;
    }

    static async updateComment(id: number, content: string): Promise<Comment> {
        const payload = { content };
        const response = await clientApi.patch<{ data: Comment }>(
            `${this.COMMENT_URL}/${id}`,
            payload
        );
        return response.data.data;
    }

    static async deleteComment(id: number): Promise<void> {
        await clientApi.delete(`${this.COMMENT_URL}/${id}`);
    }

    static async voteComment(id: number, type: 'UPVOTE' | 'DOWNVOTE'): Promise<void> {
        const payload = { voteType: type };
        await clientApi.post(
            `${this.COMMENT_URL}/${id}/vote`,
            payload
        );
    }

    // Legacy method for backward compatibility  
    static async votePost(id: string, type: 'up' | 'down'): Promise<void> {
        // TODO: Implement when vote API is available
        console.warn('Vote API not yet implemented');
    }
}
