'use client';

import CreateSolutionHeader from '@/components/problems/tabs/solutions/create/create-solution-header';
import EditorSplitPane, {
    type EditorRef,
} from '@/components/problems/tabs/solutions/create/editor-split-pane';
import MarkdownToolbar from '@/components/problems/tabs/solutions/create/markdown-toolbar';
import { TopicSelector } from '@/components/discuss/topic-selector';
import { DiscussService, type Tag } from '@/services/discuss-service';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const SUGGESTED_TAGS = [
    { id: '1', name: 'Meta', slug: 'meta' },
    { id: '2', name: 'Interview', slug: 'interview' },
    { id: '3', name: 'Facebook', slug: 'facebook' },
    { id: '4', name: 'System Design', slug: 'system-design' },
    { id: '5', name: 'Google', slug: 'google' },
    { id: '6', name: 'Dynamic Programming', slug: 'dp' },
];

export default function CreatePostPage() {
    const router = useRouter();
    const editorRef = useRef<EditorRef>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Adapter for TopicSelector to match the interface if needed, or just use as is.
    // TopicSelector expects Tag objects. existing TagLanguageSelector uses IDs.
    // I will stick with TopicSelector as it matches the service mock and simpler requirement.

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            await DiscussService.createPost({
                title,
                content,
                tags: selectedTags,
            });
            router.push('/discuss');
            router.refresh();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleReset = () => {
        setTitle('');
        setContent('');
        setSelectedTags([]);
    };

    return (
        <div className="h-[calc(100vh-65px)] bg-background flex flex-col overflow-hidden">
            <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-20 flex flex-col h-full">

                <CreateSolutionHeader
                    title={title}
                    setTitle={setTitle}
                    onPost={handlePublish}
                    onCancel={handleCancel}
                    onReset={handleReset}
                    submitLabel="Post"
                />

                <div className="py-2 space-y-4 flex-1 flex flex-col overflow-hidden">

                    {/* Tags Bar reusing my TopicSelector but styled to match */}
                    <TopicSelector
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        suggestedTags={SUGGESTED_TAGS}
                    />

                    <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden shadow-sm">
                        <MarkdownToolbar
                            onAction={(action: string) => editorRef.current?.executeAction(action)}
                        />

                        <EditorSplitPane
                            ref={editorRef}
                            content={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
