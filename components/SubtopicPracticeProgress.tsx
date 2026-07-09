'use client';

import { useMemo } from 'react';
import { ProblemStatusCountsBar } from '@/components/ProblemStatusCountsBar';
import { ProgressBar } from '@/components/ProgressBar';
import type { PracticeProblem } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { effectiveProblemStatus, emptyProblemStatusCounts } from '@/lib/problemStatus';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function SubtopicPracticeProgress({ problems }: { problems: PracticeProblem[] }) {
  const mounted = useMounted();
  const completed_practice_problem_ids = useProgressStore((state) => state.completedPracticeProblemIds);
  const problem_notes = useProgressStore((state) => state.problemNotes);
  const problem_statuses = useProgressStore((state) => state.problemStatuses);

  const stats = useMemo(() => {
    const completed_set = new Set(completed_practice_problem_ids);
    const counts = emptyProblemStatusCounts();
    for (const problem of problems) {
      const id = practiceProblemId(problem);
      const status = effectiveProblemStatus(problem_statuses[id], {
        completed: completed_set.has(id),
        hasNote: hasPracticeNote(problem_notes[id])
      });
      counts[status] += 1;
    }
    const total = problems.length;
    return {
      counts: counts,
      completed: counts.passed,
      total: total,
      percent: total === 0 ? 0 : Math.round((counts.passed / total) * 100)
    };
  }, [completed_practice_problem_ids, problem_notes, problem_statuses, problems]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;
  const counts = mounted ? stats.counts : emptyProblemStatusCounts();

  return (
    <div className="space-y-2">
      <ProgressBar
        label="題單完成進度"
        detail={`${completed}/${stats.total} 題・${percent}%`}
        percent={percent}
      />
      <ProblemStatusCountsBar counts={counts} />
    </div>
  );
}
