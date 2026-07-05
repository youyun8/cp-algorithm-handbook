'use client';

import { useMemo } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import type { Problem } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function TopicProblemsProgress({ problems, label }: { problems: Problem[]; label?: string }) {
  const mounted = useMounted();
  const reviewed_problem_ids = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);

  const stats = useMemo(() => {
    const accepted_ids = new Set(
      submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)
    );
    const reviewed_set = new Set(reviewed_problem_ids);
    const completed = problems.filter(
      (problem) => accepted_ids.has(problem.id) || reviewed_set.has(problem.id)
    ).length;
    const total = problems.length;
    return {
      completed: completed,
      total: total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [problems, reviewed_problem_ids, submissions]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;

  return (
    <ProgressBar
      label={label ?? '題單完成進度'}
      detail={`${completed}/${stats.total} 題・${percent}%`}
      percent={percent}
    />
  );
}
