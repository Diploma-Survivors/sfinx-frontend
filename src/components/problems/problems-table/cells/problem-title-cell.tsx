import { ProblemDifficulty } from '@/types/problems';
import type { Tag } from '@/types/tags';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ProblemTitleCellProps {
  id: string;
  title: string;
  difficulty: string;
  tags: Tag[];
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case ProblemDifficulty.EASY:
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case ProblemDifficulty.MEDIUM:
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case ProblemDifficulty.HARD:
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function ProblemTitleCell({
  id,
  title,
  difficulty,
  tags,
}: ProblemTitleCellProps) {
  const { t } = useTranslation('problems');
  return (
    <div className="space-y-3">
      <Link href={`/problems/${id}/description`}>
        <button
          type="button"
          className="text-left group-hover:text-primary font-bold text-base text-foreground transition-colors duration-200 hover:underline block w-full"
        >
          {title}
        </button>
      </Link>
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className={`${getDifficultyColor(difficulty)} font-medium px-3 py-1 rounded-lg border text-xs inline-block`}
        >
          {t(`difficulty_${difficulty}`)}
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground rounded-lg border border-border/50"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
