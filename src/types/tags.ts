export interface Tag {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
  postCount?: number; // Added for UI
  isActive?: boolean; // Added for UI
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name?: string;
}
