import clientApi from "@/lib/apis/axios-client";
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
} from "@/types/discuss";

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
  private static readonly BASE_URL = "/discuss";

  static async getTags(filters?: FilterTagDto): Promise<PaginatedResult<Tag>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.isActive !== undefined) {
      params.append("isActive", filters.isActive.toString());
    }
    if (filters?.search) params.append("search", filters.search);

    const response = await clientApi.get<{ data: PaginatedResult<Tag> }>(
      `${this.BASE_URL}/tags?${params.toString()}`,
    );

    return response.data.data;
  }

  static async getPosts(
    filters?: FilterPostDto,
  ): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tagIds) {
      filters.tagIds.forEach((id) => params.append("tagIds", id.toString()));
    }
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await clientApi.get<{ data: PaginatedResult<Post> }>(
      `${this.BASE_URL}/get-all?${params.toString()}`,
    );

    return response.data.data;
  }

  static async getUserPosts(
    userId: number,
    filters?: Omit<FilterPostDto, "userId">,
  ): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams();

    params.append("userId", userId.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tagIds) {
      filters.tagIds.forEach((id) => params.append("tagIds", id.toString()));
    }
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await clientApi.get<{ data: PaginatedResult<Post> }>(
      `${this.BASE_URL}/get-all?${params.toString()}`,
    );

    return response.data.data;
  }

  static async getPost(idOrSlug: string): Promise<Post> {
    const response = await clientApi.get<{ data: Post }>(
      `${this.BASE_URL}/${idOrSlug}`,
    );
    return response.data.data;
  }

  static async createPost(data: CreatePostDto): Promise<Post> {
    const payload = {
      title: data.title,
      content: data.content,
      tagIds: data.tags?.map((tag) => tag.id),
    };

    const response = await clientApi.post<{ data: Post }>(
      this.BASE_URL,
      payload,
    );
    return response.data.data;
  }

  static async updatePost(id: string, data: UpdatePostDto): Promise<Post> {
    const payload = {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.tags && { tagIds: data.tags.map((tag) => tag.id) }),
    };

    const response = await clientApi.patch<{ data: Post }>(
      `${this.BASE_URL}/${id}`,
      payload,
    );
    return response.data.data;
  }

  static async deletePost(id: string): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/${id}`);
  }

  static async getPostById(id: string): Promise<Post | null> {
    try {
      return await this.getPost(id);
    } catch (error) {
      return null;
    }
  }

  private static readonly COMMENT_URL = "/discuss-comments";

  static async getComments(postId: string): Promise<Comment[]> {
    const response = await clientApi.get<{ data: Comment[] }>(
      `${this.COMMENT_URL}/${postId}`,
    );
    return response.data.data;
  }

  static async getCommentsForPost(postId: string): Promise<Comment[]> {
    const response = await clientApi.get<{ data: Comment[] }>(
      `${this.COMMENT_URL}/${postId}`,
    );
    return response.data.data || [];
  }

  static async createComment(
    postId: string,
    content: string,
    parentId?: number,
  ): Promise<Comment> {
    const payload = { content, parentId };
    const response = await clientApi.post<{ data: Comment }>(
      `${this.COMMENT_URL}/${postId}`,
      payload,
    );
    return response.data.data;
  }

  static async updateComment(id: number, content: string): Promise<Comment> {
    const payload = { content };
    const response = await clientApi.patch<{ data: Comment }>(
      `${this.COMMENT_URL}/${id}`,
      payload,
    );
    return response.data.data;
  }

  static async deleteComment(id: number): Promise<void> {
    await clientApi.delete(`${this.COMMENT_URL}/${id}`);
  }

  static async voteComment(id: number, voteType: 1 | -1): Promise<void> {
    const payload = { voteType };
    await clientApi.post(`${this.COMMENT_URL}/${id}/vote`, payload);
  }

  static async unvoteComment(id: number): Promise<void> {
    await clientApi.delete(`${this.COMMENT_URL}/${id}/vote`);
  }

  static async getUserVoteForComment(id: number): Promise<1 | -1 | null> {
    try {
      const response = await clientApi.get<{
        data: { voteType: number | null };
      }>(`${this.COMMENT_URL}/${id}/vote`);
      return response.data.data.voteType as 1 | -1 | null;
    } catch (error) {
      return null;
    }
  }

  static async votePost(
    postId: string,
    voteType: 1 | -1,
  ): Promise<{ upvoteCount: number; downvoteCount: number }> {
    const response = await clientApi.post<{
      data: { upvoteCount: number; downvoteCount: number };
    }>(`${this.BASE_URL}/${postId}/vote`, { voteType });
    return response.data.data;
  }

  static async getUserVoteForPost(postId: string): Promise<1 | -1 | null> {
    try {
      const response = await clientApi.get<{
        data: { voteType: number | null };
      }>(`${this.BASE_URL}/${postId}/vote`);
      return response.data.data.voteType as 1 | -1 | null;
    } catch (error) {
      return null;
    }
  }

  static async unvotePost(postId: string): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/${postId}/vote`);
  }

  static async getTrendingTopics(): Promise<any[]> {
    const response = await clientApi.get<any>(
      `${this.BASE_URL}/trending-topics`,
    );
    return response.data.data;
  }

  static async incrementViewCount(postId: string): Promise<void> {
    try {
      await clientApi.post(`${this.BASE_URL}/${postId}/view`);
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  }
}
