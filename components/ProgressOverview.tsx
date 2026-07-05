'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Subtopic, Topic } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { useProgressStore } from '@/store/useProgressStore';

export function ProgressOverview({
  problems,
  topics,
  subtopics
}: {
  problems: Problem[];
  topics: Topic[];
  subtopics: Subtopic[];
}) {
  const reviewed_problem_ids = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const contest_sessions = useProgressStore((state) => state.contestSessions);
  const problem_notes = useProgressStore((state) => state.problemNotes);
  const completed_practice_problem_ids = useProgressStore((state) => state.completedPracticeProblemIds);

  const handbook_totals = useMemo(() => {
    const completed_practice_set = new Set(completed_practice_problem_ids);
    const all_practice_problems = subtopics.flatMap((subtopic) => subtopic.practice_problems ?? []);
    const completed = all_practice_problems.filter((practice_problem) => {
      const id = practiceProblemId(practice_problem);
      return completed_practice_set.has(id) || hasPracticeNote(problem_notes[id]);
    }).length;

    const covered_topic_ids = new Set<string>();
    for (const subtopic of subtopics) {
      const covered = (subtopic.practice_problems ?? []).some((practice_problem) => {
        const id = practiceProblemId(practice_problem);
        return completed_practice_set.has(id) || hasPracticeNote(problem_notes[id]);
      });
      if (covered) covered_topic_ids.add(subtopic.parent_id);
    }

    return {
      completed: completed,
      total: all_practice_problems.length,
      percent:
        all_practice_problems.length === 0 ? 0 : Math.round((completed / all_practice_problems.length) * 100),
      coveredTopics: covered_topic_ids.size
    };
  }, [completed_practice_problem_ids, problem_notes, subtopics]);

  const performance_totals = useMemo(() => {
    const problem_by_id = new Map(problems.map((problem) => [problem.id, problem]));
    const covered_topic_ids = new Set(
      reviewed_problem_ids
        .map((id) => problem_by_id.get(id)?.topic_id)
        .filter((topic_id): topic_id is string => Boolean(topic_id))
    );
    const accepted_count = new Set(
      submissions.filter((submission) => submission.status === 'AC').map((submission) => submission.problemId)
    ).size;

    return {
      acceptedCount: accepted_count,
      coveredTopics: covered_topic_ids.size
    };
  }, [problems, reviewed_problem_ids, submissions]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>手冊學習進度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <OverviewMetric
              label="完成題目"
              value={`${handbook_totals.completed}/${handbook_totals.total}`}
            />
            <OverviewMetric label="覆蓋主題" value={`${handbook_totals.coveredTopics}/${topics.length}`} />
            <OverviewMetric label="完成率" value={`${handbook_totals.percent}%`} />
            <OverviewMetric
              label="筆記數"
              value={Object.entries(problem_notes)
                .filter(([id, note]) => id.startsWith('practice:') && hasPracticeNote(note))
                .length.toString()}
            />
          </div>
          <Link
            href="/progress/handbook"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            查看手冊進度
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>實戰提交分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <OverviewMetric label="已複習題目" value={reviewed_problem_ids.length.toString()} />
            <OverviewMetric label="AC 題目" value={performance_totals.acceptedCount.toString()} />
            <OverviewMetric label="提交紀錄" value={submissions.length.toString()} />
            <OverviewMetric label="競賽場次" value={contest_sessions.length.toString()} />
          </div>
          <Link
            href="/progress/performance"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            查看實戰分析
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/45 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
