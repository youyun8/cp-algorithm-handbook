'use client';

import { useMemo } from 'react';
import { ProblemStatusCountsBar } from '@/components/ProblemStatusCountsBar';
import { ProgressBar } from '@/components/ProgressBar';
import type { Problem } from '@/lib/types';
import { effectiveProblemStatus, emptyProblemStatusCounts } from '@/lib/problemStatus';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function TopicProblemsProgress({ problems, label }: { problems: Problem[]; label?: string }) {
  const mounted = useMounted();
  const reviewed_problem_ids = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const problem_statuses = useProgressStore((state) => state.problemStatuses);

  const stats = useMemo(() => {
    const accepted_ids = new Set(
      submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)
    );
    const reviewed_set = new Set(reviewed_problem_ids);
    const counts = emptyProblemStatusCounts();
    for (const problem of problems) {
      const status = effectiveProblemStatus(problem_statuses[problem.id], {
        accepted: accepted_ids.has(problem.id),
        reviewed: reviewed_set.has(problem.id)
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
  }, [problem_statuses, problems, reviewed_problem_ids, submissions]);

  if (stats.total === 0) return null;

  const percent = mounted ? stats.percent : 0;
  const completed = mounted ? stats.completed : 0;
  const counts = mounted ? stats.counts : emptyProblemStatusCounts();

  return (
    <div className="space-y-2">
      <ProgressBar
        label={label ?? '題單完成進度'}
        detail={`${completed}/${stats.total} 題・${percent}%`}
        percent={percent}
      />
      <ProblemStatusCountsBar counts={counts} />
    </div>
  );
}
