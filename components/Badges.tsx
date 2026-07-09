import { Badge } from '@/components/ui/badge';
import type { Problem } from '@/lib/types';
import {
  difficultyClass,
  difficultyLabel,
  problemTypeClass,
  problemTypeLabel,
  sourceClass,
  sourceLabel,
  tierLabel
} from '@/lib/utils';

export function DifficultyBadge({ rating }: { rating: number }) {
  return (
    <Badge className={difficultyClass(rating)}>
      {difficultyLabel(rating)}・{rating}
    </Badge>
  );
}

export function ProblemTypeBadge({ problemType: problem_type }: { problemType: Problem['problem_type'] }) {
  return <Badge className={problemTypeClass(problem_type)}>{problemTypeLabel(problem_type)}</Badge>;
}

export function TierBadge({ tier }: { tier: Problem['tier'] }) {
  return (
    <Badge className="border-cyan-400/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200">
      {tierLabel(tier)}
    </Badge>
  );
}

export function SourceBadge({ source }: { source: Problem['source'] }) {
  return <Badge className={sourceClass(source)}>{sourceLabel(source)}</Badge>;
}
