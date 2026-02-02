import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProblemCommentType } from '@/types/comments';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CommentInputProps {
  onSubmit: (content: string, type: ProblemCommentType) => Promise<void>;
  isReply?: boolean;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string;
  initialType?: ProblemCommentType;
}

export function CommentInput({
  onSubmit,
  isReply = false,
  onCancel,
  placeholder,
  initialContent = '',
  initialType = ProblemCommentType.FEEDBACK,
}: CommentInputProps) {
  const { t } = useTranslation('problems');
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState<ProblemCommentType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content, type);
      setContent('');
      setType(ProblemCommentType.FEEDBACK);
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || t('write_comment')}
        className="min-h-[80px] text-sm resize-none"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isReply && (
            <Select
              value={type}
              onValueChange={(value) => setType(value as ProblemCommentType)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder={t('select_type')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProblemCommentType).map((tValue) => (
                  <SelectItem key={tValue} value={tValue} className="text-xs">
                    {t(tValue.toLowerCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting
              ? t('sending')
              : isReply
                ? t('reply')
                : t('post_comment')}
          </Button>
        </div>
      </div>
    </div>
  );
}
