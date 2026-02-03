'use client';

import CreateSolutionHeader from '@/components/problems/tabs/solutions/create/create-solution-header';
import CreateSolutionSkeleton from '@/components/problems/tabs/solutions/create/create-solution-skeleton';
import EditorSplitPane, {
  type EditorRef,
} from '@/components/problems/tabs/solutions/create/editor-split-pane';
import MarkdownToolbar from '@/components/problems/tabs/solutions/create/markdown-toolbar';
import TagLanguageSelector from '@/components/problems/tabs/solutions/create/tag-language-selector';
import { useDialog } from '@/components/providers/dialog-provider';
import { SolutionsService } from '@/services/solutions-service';
import { toastService } from '@/services/toasts-service';
import type { Solution } from '@/types/solutions';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EditSolutionPage() {
  const { t } = useTranslation('problems');
  const params = useParams();
  const router = useRouter();
  const problemIdString = params.id as string;
  const problemId = Number.parseInt(problemIdString);
  const solutionId = params.solutionId as string;

  const { confirm } = useDialog();

  const editorRef = useRef<EditorRef>(null);

  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [content, setContent] = useState('');
  const [originalSolution, setOriginalSolution] = useState<Solution | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!solutionId) return;

      try {
        const response = await SolutionsService.getSolutionDetail(solutionId);
        const solution = response.data.data;
        setOriginalSolution(solution);
        setTitle(solution.title);
        setContent(solution.content);
        setSelectedTags(solution.tags.map((t) => t.id));
        setSelectedLanguages(solution.languageIds);
      } catch (error) {
        console.error('Error fetching solution:', error);
        toastService.error(t('load_solution_failed'));
        router.push(`/problems/${problemId}/solutions`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolution();
  }, [problemId, solutionId, router, t]);

  const handleReset = async () => {
    if (originalSolution) {
      const result = await confirm({
        title: t('reset_changes_title'),
        message: t('reset_changes_message'),
        confirmText: t('continue'),
        cancelText: t('cancel'),
        color: 'red',
      });
      if (!result) return;

      setTitle(originalSolution.title);
      setContent(originalSolution.content);
      setSelectedTags(originalSolution.tags.map((t) => t.id));
      setSelectedLanguages(originalSolution.languageIds);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toastService.error(t('enter_solution_title_error'));
      return;
    }
    if (!content.trim()) {
      toastService.error(t('enter_solution_content_error'));
      return;
    }
    if (!originalSolution) return;

    try {
      await SolutionsService.updateSolution(solutionId, {
        problemId,
        title,
        content,
        tagIds: selectedTags,
        languageIds: selectedLanguages,
      });

      toastService.success(t('update_solution_success'));
      // Navigate back to solutions tab
      router.push(`/problems/${problemId}/solutions`);
    } catch (error) {
      console.error('Error updating solution:', error);
      toastService.error(t('update_solution_failed'));
    }
  };

  const handleCancel = async () => {
    const result = await confirm({
      title: t('cancel_edit_title'),
      message: t('cancel_edit_message'),
      confirmText: t('continue'),
      cancelText: t('cancel'),
      color: 'red',
    });
    if (!result) return;
    // navigate back to the solutions page
    router.push(`/problems/${problemId}/solutions`);
  };

  if (isLoading) {
    return <CreateSolutionSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      <div className="max-w-screen-2xl mx-auto w-full px-20 flex flex-col h-full">
        <CreateSolutionHeader
          title={title}
          setTitle={setTitle}
          onPost={handleUpdate}
          onCancel={handleCancel}
          onReset={handleReset}
          submitLabel={t('update_solution')}
        />

        <div className="py-2 space-y-4 flex-1 flex flex-col overflow-hidden">
          <TagLanguageSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedLanguages={selectedLanguages}
            onLanguagesChange={setSelectedLanguages}
          />

          <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <MarkdownToolbar
              onAction={(action: string) =>
                editorRef.current?.executeAction(action)
              }
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
