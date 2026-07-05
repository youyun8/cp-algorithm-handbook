'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Topic } from '@/lib/types';
import { useMounted } from '@/lib/useMounted';
import { useProgressStore } from '@/store/useProgressStore';

export function ProgressSummary({ problems, topics }: { problems: Problem[]; topics: Topic[] }) {
  const mounted = useMounted();
  const reviewed_problem_ids = useProgressStore((state) => state.reviewedProblemIds);
  const contest_sessions = useProgressStore((state) => state.contestSessions);
  const current_rating = useProgressStore((state) => state.currentRating);
  const submissions = useProgressStore((state) => state.submissions);
  const review_events = useProgressStore((state) => state.reviewEvents);

  const topic_count = useMemo(() => {
    const reviewed = new Set(reviewed_problem_ids);
    return new Set(problems.filter((problem) => reviewed.has(problem.id)).map((problem) => problem.topic_id))
      .size;
  }, [problems, reviewed_problem_ids]);

  const problem_by_id = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const recent_activity = useMemo(() => {
    return [
      ...submissions.map((submission) => ({
        id: submission.id,
        at: submission.createdAt,
        label: `提交：${problem_by_id.get(submission.problemId)?.title ?? '未知題目'}`
      })),
      ...review_events.map((event) => ({
        id: `${event.problemId}-${event.reviewedAt}`,
        at: event.reviewedAt,
        label: `複習：${problem_by_id.get(event.problemId)?.title ?? '未知題目'}`
      }))
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 3);
  }, [problem_by_id, review_events, submissions]);

  const stats = mounted
    ? [
        { label: '已複習題目', value: reviewed_problem_ids.length.toString() },
        { label: '覆蓋主題', value: `${topic_count}/${topics.length}` },
        { label: '模擬賽場次', value: contest_sessions.length.toString() },
        { label: '自評分數', value: current_rating.toString() }
      ]
    : [
        { label: '已複習題目', value: '0' },
        { label: '覆蓋主題', value: `0/${topics.length}` },
        { label: '模擬賽場次', value: '0' },
        { label: '自評分數', value: '1800' }
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>近期進度摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:border-primary/50"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-border bg-background/45 p-4">
          <p className="text-sm font-medium">最近活動</p>
          {mounted && recent_activity.length > 0 ? (
            <div className="mt-3 space-y-2">
              {recent_activity.map((activity) => (
                <p key={activity.id} className="text-sm text-muted-foreground">
                  {activity.label}・{new Date(activity.at).toLocaleDateString('zh-TW')}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">尚未有本機活動紀錄。</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
