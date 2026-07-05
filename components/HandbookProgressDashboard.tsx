'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DifficultyBadge, SourceBadge, TierBadge } from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeProblem, Subtopic, Topic } from '@/lib/types';
import { hasPracticeNote, practiceProblemId } from '@/lib/practiceProgress';
import { problemDisplayTitle } from '@/lib/utils';
import { useProgressStore } from '@/store/useProgressStore';

type HandbookFilter = 'all' | 'incomplete' | 'completed';

interface ActivePracticeNote {
  id: string;
  title: string;
}

export function HandbookProgressDashboard({ topics, subtopics }: { topics: Topic[]; subtopics: Subtopic[] }) {
  const practice_completion_events = useProgressStore((state) => state.practiceCompletionEvents);
  const problem_notes = useProgressStore((state) => state.problemNotes);
  const completed_practice_problem_ids = useProgressStore((state) => state.completedPracticeProblemIds);
  const mark_practice_problem_completed = useProgressStore((state) => state.markPracticeProblemCompleted);
  const unmark_practice_problem_completed = useProgressStore((state) => state.unmarkPracticeProblemCompleted);
  const [handbook_filter, set_handbook_filter] = useState<HandbookFilter>('all');
  const [active_practice_note, set_active_practice_note] = useState<ActivePracticeNote | null>(null);

  const topic_by_id = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
  const completed_practice_set = useMemo(
    () => new Set(completed_practice_problem_ids),
    [completed_practice_problem_ids]
  );

  const handbook_practice_breakdown = useMemo(() => {
    return subtopics
      .map((subtopic) => {
        const practice_problems = subtopic.practice_problems ?? [];
        const rows = practice_problems.map((practice_problem) => {
          const id = practiceProblemId(practice_problem);
          const completed = completed_practice_set.has(id) || hasPracticeNote(problem_notes[id]);
          return { id: id, problem: practice_problem, completed: completed };
        });
        const completed_count = rows.filter((row) => row.completed).length;
        const total = rows.length;
        const parent_topic = topic_by_id.get(subtopic.parent_id);
        return {
          subtopic,
          parentTopic: parent_topic,
          rows: rows,
          completedCount: completed_count,
          total: total,
          percent: total === 0 ? 0 : Math.round((completed_count / total) * 100)
        };
      })
      .filter((item) => item.total > 0)
      .filter((item) => {
        if (handbook_filter === 'completed') return item.completedCount === item.total;
        if (handbook_filter === 'incomplete') return item.completedCount < item.total;
        return true;
      });
  }, [completed_practice_set, handbook_filter, problem_notes, subtopics, topic_by_id]);

  const handbook_practice_totals = useMemo(() => {
    const all_practice_problems = subtopics.flatMap((subtopic) => subtopic.practice_problems ?? []);
    const total = all_practice_problems.length;
    const completed = all_practice_problems.filter((practice_problem) => {
      const id = practiceProblemId(practice_problem);
      return completed_practice_set.has(id) || hasPracticeNote(problem_notes[id]);
    }).length;
    return {
      total: total,
      completed: completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [completed_practice_set, problem_notes, subtopics]);

  const covered_topic_ids = useMemo(() => {
    const topic_ids = new Set<string>();
    for (const subtopic of subtopics) {
      const covered = (subtopic.practice_problems ?? []).some((practice_problem) => {
        const id = practiceProblemId(practice_problem);
        return completed_practice_set.has(id) || hasPracticeNote(problem_notes[id]);
      });
      if (covered) topic_ids.add(subtopic.parent_id);
    }
    return topic_ids;
  }, [completed_practice_set, problem_notes, subtopics]);

  const note_count = useMemo(
    () =>
      Object.entries(problem_notes).filter(
        ([id, note]) => id.startsWith('practice:') && hasPracticeNote(note)
      ).length,
    [problem_notes]
  );

  const heatmap_days = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of practice_completion_events) {
      const key = event.completedAt.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const [id, note] of Object.entries(problem_notes)) {
      if (!id.startsWith('practice:')) continue;
      if (!hasPracticeNote(note)) continue;
      const key = note.updatedAt.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (34 - index));
      const key = date.toISOString().slice(0, 10);
      return { key: key, count: counts.get(key) ?? 0 };
    });
  }, [practice_completion_events, problem_notes]);

  const stats = [
    { label: '手冊完成題目', value: handbook_practice_totals.completed },
    { label: '手冊覆蓋主題', value: `${covered_topic_ids.size}/${topics.length}` },
    { label: '筆記數', value: note_count },
    { label: '總完成率', value: `${handbook_practice_totals.percent}%` }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>手冊練習熱力圖</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {heatmap_days.map((day) => (
              <div
                key={day.key}
                title={`${day.key}：${day.count} 筆`}
                className={
                  day.count === 0
                    ? 'h-10 rounded-lg border border-border bg-background'
                    : day.count < 3
                      ? 'h-10 rounded-lg border border-emerald-400/30 bg-emerald-500/30'
                      : 'h-10 rounded-lg border border-emerald-300/50 bg-emerald-500/70'
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>手冊練習進度</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                已完成 {handbook_practice_totals.completed}/{handbook_practice_totals.total} 題・
                {handbook_practice_totals.percent}%
              </p>
            </div>
            <div className="flex rounded-xl border border-border bg-background p-1">
              {[
                { id: 'all', label: '全部' },
                { id: 'incomplete', label: '未完成' },
                { id: 'completed', label: '已完成' }
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => set_handbook_filter(option.id as HandbookFilter)}
                  className={
                    handbook_filter === option.id
                      ? 'rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground'
                      : 'rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-3 rounded-full bg-accent">
            <div
              className="h-3 rounded-full bg-primary"
              style={{ width: `${handbook_practice_totals.percent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {handbook_practice_breakdown.length > 0 ? (
            handbook_practice_breakdown.map((item) => (
              <div key={item.subtopic.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.parentTopic?.title ?? '未分類主題'}
                    </p>
                    <h3 className="mt-1 font-semibold">{item.subtopic.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold">
                      {item.completedCount}/{item.total} 題・{item.percent}%
                    </span>
                    {item.parentTopic ? (
                      <Link
                        href={`/handbook/${item.parentTopic.slug}/${item.subtopic.slug}#practice`}
                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        前往練習
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-accent">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                </div>
                <div className="mt-4 grid gap-2">
                  {item.rows.map((row) => (
                    <PracticeProgressRow
                      key={row.id}
                      id={row.id}
                      problem={row.problem}
                      completed={row.completed}
                      onOpenNote={() =>
                        set_active_practice_note({ id: row.id, title: problemDisplayTitle(row.problem) })
                      }
                      onToggleCompleted={() =>
                        completed_practice_set.has(row.id)
                          ? unmark_practice_problem_completed(row.id)
                          : mark_practice_problem_completed(row.id)
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              目前沒有符合篩選條件的手冊練習題。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>手冊覆蓋主題</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {covered_topic_ids.size > 0 ? (
            Array.from(covered_topic_ids).map((topic_id) => (
              <span key={topic_id} className="rounded-full border border-border bg-accent px-3 py-2 text-sm">
                {topic_by_id.get(topic_id)?.title ?? '未分類'}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">尚未完成任何手冊練習或筆記。</p>
          )}
        </CardContent>
      </Card>

      <ProblemNotesModal
        problemId={active_practice_note?.id ?? ''}
        title={active_practice_note?.title}
        open={Boolean(active_practice_note)}
        onClose={() => set_active_practice_note(null)}
      />
    </div>
  );
}

function PracticeProgressRow({
  id,
  problem,
  completed,
  onOpenNote: on_open_note,
  onToggleCompleted: on_toggle_completed
}: {
  id: string;
  problem: PracticeProblem;
  completed: boolean;
  onOpenNote: () => void;
  onToggleCompleted: () => void;
}) {
  const explicitly_completed = useProgressStore((state) => state.completedPracticeProblemIds.includes(id));

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background/55 p-3 transition hover:border-primary/35 hover:bg-background/80 md:grid-cols-[1fr_auto]">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <SourceBadge source={problem.source} />
          {problem.rating ? <DifficultyBadge rating={problem.rating} /> : null}
          {problem.tier ? <TierBadge tier={problem.tier} /> : null}
        </div>
        <div>
          <p className="text-sm font-semibold leading-6">{problemDisplayTitle(problem)}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <span
          className={
            completed
              ? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300'
              : 'rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-muted-foreground'
          }
        >
          {completed ? '已完成' : '未完成'}
        </span>
        <button
          type="button"
          onClick={on_open_note}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          筆記
        </button>
        <button
          type="button"
          onClick={on_toggle_completed}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          {explicitly_completed ? '取消' : '完成'}
        </button>
      </div>
    </div>
  );
}
