import type { ProblemNote, ProblemStatus } from '@/lib/types';

// The three practice states, in display / cycle order.
export const kProblemStatusOrder: ProblemStatus[] = ['none', 'review', 'passed'];

interface ProblemStatusMeta {
  label: string;
  // Badge classes for the resting (display) state.
  className: string;
  // Short helper shown on hover / as aria description.
  hint: string;
}

export const kProblemStatusMeta: Record<ProblemStatus, ProblemStatusMeta> = {
  none: {
    label: '尚未練習',
    className: 'border-border bg-muted/40 text-muted-foreground',
    hint: '點擊切換為需複習'
  },
  review: {
    label: '需複習',
    className: 'border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-200',
    hint: '點擊切換為已通過'
  },
  passed: {
    label: '已通過',
    className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
    hint: '點擊切換為尚未練習'
  }
};

export function nextProblemStatus(status: ProblemStatus): ProblemStatus {
  const index = kProblemStatusOrder.indexOf(status);
  return kProblemStatusOrder[(index + 1) % kProblemStatusOrder.length];
}

export function noteHasContent(note?: Pick<ProblemNote, 'solution' | 'thought'>) {
  return Boolean(note && (note.solution.trim() || note.thought.trim()));
}

// Signals used to derive a status for problems that predate the unified
// `problemStatuses` record. Once a user clicks a status the explicit value in
// `problemStatuses` always wins over these.
export interface LegacyStatusSignals {
  accepted?: boolean;
  reviewed?: boolean;
  completed?: boolean;
  hasNote?: boolean;
}

function statusFromLegacy(signals: LegacyStatusSignals): ProblemStatus {
  if (signals.accepted) return 'passed';
  if (signals.reviewed || signals.completed || signals.hasNote) return 'review';
  return 'none';
}

// The single source of truth for a problem's status: an explicit stored value
// if the user has set one, otherwise a value derived from legacy progress data.
export function effectiveProblemStatus(
  explicit: ProblemStatus | undefined,
  signals: LegacyStatusSignals
): ProblemStatus {
  return explicit ?? statusFromLegacy(signals);
}

export type ProblemStatusCounts = Record<ProblemStatus, number>;

export function emptyProblemStatusCounts(): ProblemStatusCounts {
  return { none: 0, review: 0, passed: 0 };
}
