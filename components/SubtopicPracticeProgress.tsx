'use client';

import { useMemo } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import type { PracticeProblem } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function SubtopicPracticeProgress({ problems }: { problems: PracticeProblem[] }) {
  const mounted = useMounted();
  const completed_practice_problem_ids = useProgressStore((state) => state.completedPracticeProblemIds);
  const problem_notes = useProgressStore((state) => state.problemNotes);

  const stats = useMemo(() => {
    const completed_set = new Set(completed_practice_problem_ids);
    const completed = problems.filter((problem) => {
      const id = practiceProblemId(problem);
      return completed_set.has(id) || hasPracticeNote(problem_notes[id]);
    }).length;
    const total = problems.length;
    return {
      completed: completed,
      total: total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [completed_practice_problem_ids, problem_notes, problems]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;

  return (
    <ProgressBar
      label="題單完成進度"
      detail={`${completed}/${stats.total} 題・${percent}%`}
      percent={percent}
    />
  );
}
