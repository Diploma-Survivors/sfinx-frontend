'use client';

import CreateSolutionHeader from '@/components/problems/tabs/solutions/create/create-solution-header';
import EditorSplitPane, {
    type EditorRef,
} from '@/components/problems/tabs/solutions/create/editor-split-pane';
import MarkdownToolbar from '@/components/problems/tabs/solutions/create/markdown-toolbar';
import { TopicSelector } from '@/components/discuss/filters/topic-selector';
import { DiscussService, type Tag } from '@/services/discuss-service';
import { toastService } from '@/services/toasts-service';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 255;
const MIN_CONTENT_LENGTH = 10;

interface PostEditorProps {
    initialData?: {
        title: string;
        content: string;
        tags: Tag[];
    };
    onSubmit: (data: { title: string; content: string; tags: Tag[] }) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    pageTitle?: string; // e.g. "Create New Post" or "Edit Post"
}

export function PostEditor({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = "Post",
    pageTitle
}: PostEditorProps) {
    const editorRef = useRef<EditorRef>(null);

    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.tags || []);
    const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await DiscussService.getTags({ isActive: true });
                setSuggestedTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                toastService.error('Failed to load tags');
            } finally {
                setIsLoadingTags(false);
            }
        };

        fetchTags();
    }, []);

    // Update state if initialData changes (e.g. when loaded asynchronously)
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setContent(initialData.content);
            setSelectedTags(initialData.tags);
        }
    }, [initialData]);

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        // Validation
        if (!trimmedTitle) {
            toastService.error('Title is required');
            return;
        }

        if (trimmedTitle.length < MIN_TITLE_LENGTH) {
            toastService.error(`Title must be at least ${MIN_TITLE_LENGTH} characters`);
            return;
        }

        if (trimmedTitle.length > MAX_TITLE_LENGTH) {
            toastService.error(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
            return;
        }

        if (!trimmedContent) {
            toastService.error('Content is required');
            return;
        }

        if (trimmedContent.length < MIN_CONTENT_LENGTH) {
            toastService.error(`Content must be at least ${MIN_CONTENT_LENGTH} characters`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                title: trimmedTitle,
                content: trimmedContent,
                tags: selectedTags,
            });
        } catch (error) {
            console.error('Failed to submit post:', error);
            // Error handling should be done by the parent or caught here if specific
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setTitle(initialData?.title || '');
        setContent(initialData?.content || '');
        setSelectedTags(initialData?.tags || []);
    };

    return (
        <div className="h-[calc(100vh-65px)] bg-background flex flex-col overflow-hidden">
            <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-20 flex flex-col h-full">

                <CreateSolutionHeader
                    title={title}
                    setTitle={setTitle}
                    onPost={handleSubmit}
                    onCancel={onCancel}
                    onReset={handleReset}
                    submitLabel={submitLabel}
                />

                <div className="py-2 space-y-4 flex-1 flex flex-col overflow-hidden">

                    <TopicSelector
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        suggestedTags={suggestedTags}
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
