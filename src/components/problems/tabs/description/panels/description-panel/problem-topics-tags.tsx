import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Tag } from '@/types/tags';
import type { Topic } from '@/types/topics';
import { ChevronDown, Tag as TagIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProblemTopicsTagsProps {
  topics?: Topic[];
  tags?: Tag[];
}

export function ProblemTopicsTags({
  topics = [],
  tags = [],
}: ProblemTopicsTagsProps) {
  const { t } = useTranslation('problems');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-border"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left hover:bg-muted/50 transition-colors px-1 rounded-lg">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <TagIcon className="w-4 h-4" />
          <span>{t('topics_tags_title')}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-4 pt-2 px-1 space-y-4">
          {topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {t('topics')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Badge
                    key={topic.id}
                    variant="outline"
                    className="text-muted-foreground border-border hover:bg-muted/50"
                  >
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {t('tags')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-muted-foreground border-border hover:bg-muted/50"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && tags.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              {t('no_topics_tags')}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
