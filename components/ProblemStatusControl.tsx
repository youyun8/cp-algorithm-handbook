'use client';

import { Badge } from '@/components/ui/badge';
import {
  effectiveProblemStatus,
  kProblemStatusMeta,
  noteHasContent,
  type LegacyStatusSignals
} from '@/lib/problemStatus';
import { useMounted } from '@/lib/useMounted';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

// A single clickable status pill used everywhere a problem is listed. It reads
// the unified status from the store (falling back to legacy signals for
// problems recorded before the unified system) and cycles on click:
// 尚未練習 → 需複習 → 已通過 → 尚未練習.
export function ProblemStatusControl({
  problemId: problem_id,
  legacySignals: legacy_signals,
  className
}: {
  problemId: string;
  legacySignals?: LegacyStatusSignals;
  className?: string;
}) {
  const mounted = useMounted();
  const explicit = useProgressStore((state) => state.problemStatuses[problem_id]);
  const note = useProgressStore((state) => state.problemNotes[problem_id]);
  const cycle_problem_status = useProgressStore((state) => state.cycleProblemStatus);

  const signals: LegacyStatusSignals = {
    ...legacy_signals,
    hasNote: legacy_signals?.hasNote ?? noteHasContent(note)
  };

  // Before hydration the store is empty; render the neutral state to keep SSR
  // and the first client paint identical.
  const status = mounted ? effectiveProblemStatus(explicit, signals) : 'none';
  const meta = kProblemStatusMeta[status];

  return (
    <button
      type="button"
      onClick={() => cycle_problem_status(problem_id, status)}
      title={meta.hint}
      aria-label={`練習狀態：${meta.label}，${meta.hint}`}
      className="rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Badge className={cn('cursor-pointer select-none hover:brightness-105', meta.className, className)}>
        {meta.label}
      </Badge>
    </button>
  );
}
