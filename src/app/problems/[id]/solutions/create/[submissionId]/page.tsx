'use client';

import CreateSolutionHeader from '@/components/problems/tabs/solutions/create/create-solution-header';
import CreateSolutionSkeleton from '@/components/problems/tabs/solutions/create/create-solution-skeleton';
import EditorSplitPane, {
  type EditorRef,
} from '@/components/problems/tabs/solutions/create/editor-split-pane';
import MarkdownToolbar from '@/components/problems/tabs/solutions/create/markdown-toolbar';
import TagLanguageSelector from '@/components/problems/tabs/solutions/create/tag-language-selector';
import { useDialog } from '@/components/providers/dialog-provider';
import { useApp } from '@/contexts/app-context';
import { SolutionsService } from '@/services/solutions-service';
import { SubmissionsService } from '@/services/submissions-service';
import { toastService } from '@/services/toasts-service';
import type { RootState } from '@/store/index';
import { resetDraft, setDraft } from '@/store/slides/create-solution-slice';
import { type Submission, SubmissionStatus } from '@/types/submissions';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export default function CreateSolutionPage() {
  const { t } = useTranslation('problems');
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const problemIdString = params.id as string;
  const problemId = Number.parseInt(problemIdString);
  const submissionIdString = params.submissionId as string;
  const submissionId = Number.parseInt(submissionIdString);

  const { confirm } = useDialog();

  const editorRef = useRef<EditorRef>(null);

  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [content, setContent] = useState('');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const drafts = useSelector((state: RootState) => state.createSolution.drafts);
  const draftsRef = useRef(drafts);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const loadDefaultContent = useCallback(
    async (sub: Submission) => {
      try {
        const sourceCode = sub.sourceCode;
        const langName = sub.language?.name.toLowerCase();

        const defaultMarkdown = `# ${t('intuition')}

# ${t('approach')}
<!-- ${t('description_placeholder')} -->

# ${t('complexity')}
- ${t('time_complexity')}:
<!-- ${t('time_complexity_placeholder')} -->

- ${t('space_complexity')}:
<!-- ${t('space_complexity_placeholder')} -->

# ${t('code')}
\`\`\`${langName} []
// ${t('code_placeholder')}
\`\`\`
`;

        let newContent = defaultMarkdown.replace('cpp []', `${langName} []`);
        newContent = newContent.replace(
          `// ${t('code_placeholder')}`,
          sourceCode || ''
        );
        setContent(newContent);
      } catch (error) {
        console.error('Error loading default content:', error);
      }
    },
    [t]
  );

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;

      try {
        const response =
          await SubmissionsService.getSubmissionById(submissionId);
        const sub = response.data.data;

        setSubmission(sub);

        const draft = draftsRef.current[sub.id.toString()];
        if (draft) {
          setContent(draft);
        } else {
          await loadDefaultContent(sub);
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        // Handle 404 or other errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [loadDefaultContent, submissionId]);

  // Save draft on content change
  useEffect(() => {
    if (submission) {
      dispatch(
        setDraft({
          submissionId: submission.id.toString(),
          content,
        })
      );
    }
  }, [content, submission, dispatch]);

  const handleReset = async () => {
    if (submission) {
      const result = await confirm({
        title: t('cancel_post_title'),
        message: t('cancel_post_message'),
        confirmText: t('continue'),
        cancelText: t('cancel'),
        color: 'red',
      });
      if (!result) return;
      dispatch(resetDraft(submission.id.toString()));
      await loadDefaultContent(submission);
    }
  };

  const { isLoggedin, isEmailVerified } = useApp();
  const { t: tCommon } = useTranslation('common');

  const handlePost = async () => {
    if (!isLoggedin) {
      toastService.error(tCommon('login_required_action'));
      return;
    }
    if (!isEmailVerified) {
      toastService.error(tCommon('email_verification_required_action'));
      return;
    }

    if (!title.trim()) {
      toastService.error(t('enter_solution_title_error'));
      return;
    }
    if (!content.trim()) {
      toastService.error(t('enter_solution_content_error'));
      return;
    }
    if (!submission) return;

    try {
      await SolutionsService.createSolution({
        problemId,
        title,
        content,
        tagIds: selectedTags,
        languageIds: selectedLanguages,
      });

      // Clear draft
      dispatch(resetDraft(submission.id.toString()));

      // Navigate back to solutions tab
      toastService.success(t('create_solution_success'));
      router.push(`/problems/${problemId}/solutions`);
    } catch (error) {
      console.error('Error creating solution:', error);
      toastService.error(t('create_solution_failed'));
    }
  };

  const handleCancel = async () => {
    const result = await confirm({
      title: t('cancel_post_title'),
      message: t('cancel_post_message'),
      confirmText: t('continue'),
      cancelText: t('cancel'),
      color: 'red',
    });
    if (!result) return;
    // navigate back to the problem page
    router.push(`/problems/${problemId}/description`);
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
          onPost={handlePost}
          onCancel={handleCancel}
          onReset={handleReset}
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
