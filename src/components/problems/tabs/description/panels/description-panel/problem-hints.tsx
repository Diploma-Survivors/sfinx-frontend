import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Hint } from '@/types/problems';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProblemHintsProps {
  hints: Hint[];
}

export function ProblemHints({ hints }: ProblemHintsProps) {
  return (
    <div className="space-y-2">
      {hints.map((hint, index) => (
        <HintItem key={index} hint={hint} index={index} />
      ))}
    </div>
  );
}

function HintItem({ hint, index }: { hint: Hint; index: number }) {
  const { t } = useTranslation('problems');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-border rounded-lg bg-card overflow-hidden"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 font-medium">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span>
            {t('hint')} {index + 1}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0 text-muted-foreground text-sm">
          <div className="pt-2 border-t border-border/50">{hint.content}</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
