
export interface Author {
    id: string;
    name: string;
    avatar: string;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Comment {
    id: string;
    content: string; // Markdown
    author: Author;
    createdAt: string;
    upvotes: number;
    replies?: Comment[];
}

export interface Post {
    id: string;
    title: string;
    content: string; // Markdown
    author: Author;
    createdAt: string;
    updatedAt?: string;
    viewCount: number;
    commentCount: number;
    upvotes: number;
    tags: Tag[];
    isSolved?: boolean;
}

const MOCK_AUTHORS: Author[] = [
    { id: '1', name: 'Minmer', avatar: 'https://github.com/shadcn.png' },
    { id: '2', name: 'Sachin Kumar', avatar: 'https://github.com/shadcn.png' },
    { id: '3', name: 'Anonymous User', avatar: '' }, // Fallback for no avatar
];

const MOCK_TAGS: Tag[] = [
    { id: '1', name: 'Meta', slug: 'meta' },
    { id: '2', name: 'Interview', slug: 'interview' },
    { id: '3', name: 'Facebook', slug: 'facebook' },
    { id: '4', name: 'System Design', slug: 'system-design' },
];

const MOCK_POSTS: Post[] = [
    {
        id: '1',
        title: 'The Puzzle || AI-enabled Coding Round Interview Prep',
        content: `Hey y'all, the last Post seemed helpful so I got another AI-enabled coding round up. This time, it's for The Puzzle.

I found the implementation pretty demanding, I'm curious how others chose to optimize...

## Key Challenges
1. Managing state efficiently
2. Handling edge cases with AI prompts

\`\`\`python
def solve_puzzle(input):
    # AI logic here
    return "solved"
\`\`\`
    `,
        author: MOCK_AUTHORS[0],
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        viewCount: 39,
        commentCount: 0,
        upvotes: 3,
        tags: [MOCK_TAGS[0], MOCK_TAGS[1], MOCK_TAGS[2]],
    },
    {
        id: '2',
        title: '[Partner Search] 6-Month Roadmap to PBC | DSA (2/day) + System Design',
        content: 'Hey everyone, I am looking for a dedicated study partner to prepare for Product-Based Company (PBC) interviews over the next 6 months...',
        author: MOCK_AUTHORS[1],
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        viewCount: 9,
        commentCount: 0,
        upvotes: 0,
        tags: [MOCK_TAGS[1], MOCK_TAGS[3]],
    },
    {
        id: '3',
        title: 'Salesforce | MTS | 2026',
        content: 'Hi folks, i have an upcoming onsite HM round next week, i was hoping if i could get some insights on what i should expect? Thanks in advance!',
        author: MOCK_AUTHORS[2],
        createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        viewCount: 140,
        commentCount: 3,
        upvotes: 1,
        tags: [MOCK_TAGS[1]],
    },
];

export class DiscussService {
    static async getPosts(filter: string = 'for-you'): Promise<Post[]> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_POSTS;
    }

    static async getPostById(id: string): Promise<Post | null> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_POSTS.find((p) => p.id === id) || null;
    }

    static async createPost(data: Partial<Post>): Promise<Post> {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newPost: Post = {
            id: Math.random().toString(36).substr(2, 9),
            title: data.title || 'Untitled',
            content: data.content || '',
            author: MOCK_AUTHORS[0], // Mock current user
            createdAt: new Date().toISOString(),
            viewCount: 0,
            commentCount: 0,
            upvotes: 0,
            tags: data.tags || [],
        };
        MOCK_POSTS.unshift(newPost);
        return newPost;
    }

    static async votePost(id: string, type: 'up' | 'down'): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        console.log(`Voted ${type} on post ${id}`);
    }
}
