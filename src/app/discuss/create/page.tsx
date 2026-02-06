'use client';

import { PostEditor } from '@/components/discuss/post-editor';
import { DiscussService, type Tag } from '@/services/discuss-service';
import { toastService } from '@/services/toasts-service';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
    const router = useRouter();

    const handlePublish = async (data: { title: string; content: string; tags: Tag[] }) => {
        try {
            const createdPost = await DiscussService.createPost({
                title: data.title,
                content: data.content,
                tags: data.tags,
            });
            toastService.success('Post created successfully!');
            router.push(`/discuss/${createdPost.id}`);
            router.refresh();
        } catch (error) {
            console.error('Failed to create post:', error);
            toastService.error('Failed to create post. Please try again.');
            throw error;
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <PostEditor
            onSubmit={handlePublish}
            onCancel={handleCancel}
            submitLabel="Post"
            pageTitle="Create New Post"
        />
    );
}
