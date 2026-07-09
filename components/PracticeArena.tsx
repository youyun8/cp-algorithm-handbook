'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  ListChecks,
  RefreshCw,
  Shuffle,
  SkipForward,
  Swords,
  Trophy,
  X,
  type LucideIcon
} from 'lucide-react';
import { DifficultyBadge, ProblemTypeBadge } from '@/components/Badges';
import { ProblemNotesModal } from '@/components/ProblemNotesModal';
import { ProblemSourceLink } from '@/components/ProblemSourceLink';
import { ProblemStatusControl } from '@/components/ProblemStatusControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { effectiveProblemStatus } from '@/lib/problemStatus';
import type { Contest, ContestProblem, Problem, SubmissionStatus, Subtopic, Topic } from '@/lib/types';
import {
  cn,
  problemDisplayTitle,
  problemTypeLabel,
  ratingBands,
  submissionStatusLabel,
  toneSelectedClass
} from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProgressStore } from '@/store/useProgressStore';

const kStatusOptions: SubmissionStatus[] = ['AC', 'WA', 'TLE', 'SKIP'];

const kPageSize = 20;
type ContestType = 'all' | 'weekly' | 'biweekly';
type Position = 0 | 1 | 2 | 3;
type ActiveTab = 'problems' | 'contest' | 'lc-contest';

interface PickedContestProblem {
  problem: ContestProblem;
  contest: Contest;
  position: Position;
  canonicalProblem?: Problem;
}

const kPositionLabels: Record<Position, string> = { 0: 'Q1', 1: 'Q2', 2: 'Q3', 3: 'Q4' };

const kPositionClass: Record<Position, string> = {
  0: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  1: 'border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300',
  2: 'border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300',
  3: 'border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
};

const kStatusIcon: Record<SubmissionStatus, LucideIcon> = {
  AC: Check,
  WA: X,
  TLE: Clock,
  SKIP: SkipForward
};

const kStatusButtonClass: Record<SubmissionStatus, string> = {
  AC: 'hover:border-emerald-400/60 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-300',
  WA: 'hover:border-red-400/60 hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-300',
  TLE: 'hover:border-amber-400/60 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-300',
  SKIP: 'hover:border-slate-400/60 hover:bg-slate-500/15 hover:text-slate-600 dark:hover:text-slate-300'
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function lcUrl(title_slug: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/problems/${title_slug}/`;
}

function contestUrl(contest_id: string, site: 'cn' | 'en') {
  const host = site === 'en' ? 'leetcode.com' : 'leetcode.cn';
  return `https://${host}/contest/${contest_id}/`;
}

export function PracticeArena({
  problems,
  topics,
  subtopics,
  contests
}: {
  problems: Problem[];
  topics: Topic[];
  subtopics: Subtopic[];
  contests: Contest[];
}) {
  const [active_tab, set_active_tab] = useState<ActiveTab>('problems');
  const [problem_count, set_problem_count] = useState(5);
  const [duration_minutes, set_duration_minutes] = useState(90);
  const [page, set_page] = useState(1);
  const [filter_signature_state, set_filter_signature_state] = useState('');
  const [topic_filter, set_topic_filter] = useState('all');
  const [subtopic_filter, set_subtopic_filter] = useState('all');
  const [contest_type, set_contest_type] = useState<ContestType>('all');
  const [contest_positions, set_contest_positions] = useState<Set<Position>>(new Set([2, 3]));
  const [contest_min_rating, set_contest_min_rating] = useState(1600);
  const [contest_max_rating, set_contest_max_rating] = useState(2800);
  const [contest_pick_count, set_contest_pick_count] = useState(4);
  const [picked_contest_problems, set_picked_contest_problems] = useState<PickedContestProblem[]>([]);
  const [now, set_now] = useState(() => Date.now());
  const leet_code_site = useSettingsStore((state) => state.leetCodeSite);
  const current_rating = useProgressStore((state) => state.currentRating);
  const filters = useProgressStore((state) => state.filters);
  const reviewed_problem_ids = useProgressStore((state) => state.reviewedProblemIds);
  const submissions = useProgressStore((state) => state.submissions);
  const problem_statuses = useProgressStore((state) => state.problemStatuses);
  const active_contest = useProgressStore((state) => state.activeContest);
  const set_current_rating = useProgressStore((state) => state.setCurrentRating);
  const set_filters = useProgressStore((state) => state.setFilters);
  const start_contest = useProgressStore((state) => state.startContest);
  const end_contest = useProgressStore((state) => state.endContest);
  const log_submission = useProgressStore((state) => state.logSubmission);

  useEffect(() => {
    const timer = window.setInterval(() => set_now(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const topic_by_id = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
  const problem_by_id = useMemo(() => new Map(problems.map((problem) => [problem.id, problem])), [problems]);
  const problem_by_slug = useMemo(
    () =>
      new Map(
        problems
          .filter((problem) => problem.source === 'leetcode')
          .map((problem) => [problem.source_id, problem])
      ),
    [problems]
  );
  const visible_subtopics = useMemo(
    () => subtopics.filter((subtopic) => topic_filter === 'all' || subtopic.parent_id === topic_filter),
    [subtopics, topic_filter]
  );
  const reviewed_set = useMemo(() => new Set(reviewed_problem_ids), [reviewed_problem_ids]);
  const accepted_set = useMemo(
    () =>
      new Set(
        submissions
          .filter((submission) => submission.status === 'AC')
          .map((submission) => submission.problemId)
      ),
    [submissions]
  );
  const status_for = useMemo(() => {
    return (id: string) =>
      effectiveProblemStatus(problem_statuses[id], {
        accepted: accepted_set.has(id),
        reviewed: reviewed_set.has(id)
      });
  }, [accepted_set, problem_statuses, reviewed_set]);
  const all_tags = useMemo(
    () => Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort(),
    [problems]
  );
  const bands = ratingBands(current_rating);

  const filtered_problems = useMemo(() => {
    return problems
      .filter((problem) => {
        if (filters.tag !== 'all' && !problem.tags.includes(filters.tag)) return false;
        if (topic_filter !== 'all' && problem.topic_id !== topic_filter) return false;
        if (subtopic_filter !== 'all' && !problem.subtopic_ids?.includes(subtopic_filter)) return false;
        if (problem.rating < filters.minRating) return false;
        if (filters.maxRating !== null && problem.rating > filters.maxRating) return false;
        if (filters.problemType !== 'all' && problem.problem_type !== filters.problemType) return false;
        if (filters.completion !== 'all' && status_for(problem.id) !== filters.completion) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.band === 'stretch') return (b.solve_count ?? 0) - (a.solve_count ?? 0);
        return a.rating - b.rating || (b.solve_count ?? 0) - (a.solve_count ?? 0);
      });
  }, [filters, problems, status_for, subtopic_filter, topic_filter]);

  const contest_pool = useMemo<PickedContestProblem[]>(() => {
    const result: PickedContestProblem[] = [];
    for (const contest of contests) {
      if (contest_type !== 'all' && contest.type !== contest_type) continue;
      for (const position of [0, 1, 2, 3] as Position[]) {
        if (!contest_positions.has(position)) continue;
        const problem = contest.problems[position];
        if (!problem) continue;
        if (problem.rating === 0) continue;
        if (problem.rating < contest_min_rating || problem.rating > contest_max_rating) continue;
        result.push({
          problem: problem,
          contest: contest,
          position: position,
          canonicalProblem: problem_by_slug.get(problem.titleSlug)
        });
      }
    }
    return result;
  }, [contest_max_rating, contest_min_rating, contest_positions, contest_type, contests, problem_by_slug]);

  const contest_problems = useMemo(() => {
    if (!active_contest) return [];
    const picked = new Set(active_contest.problemIds);
    return problems.filter((problem) => picked.has(problem.id));
  }, [active_contest, problems]);

  const total_pages = Math.max(1, Math.ceil(filtered_problems.length / kPageSize));
  const current_page = Math.min(page, total_pages);
  const paged_problems = useMemo(
    () => filtered_problems.slice((current_page - 1) * kPageSize, current_page * kPageSize),
    [filtered_problems, current_page]
  );

  const filter_signature = `${filters.tag}|${filters.problemType}|${filters.completion}|${filters.band}|${filters.minRating}|${filters.maxRating}|${current_rating}|${topic_filter}|${subtopic_filter}`;
  if (filter_signature !== filter_signature_state) {
    set_filter_signature_state(filter_signature);
    set_page(1);
  }

  const remaining_text = useMemo(() => {
    if (!active_contest) return '尚未開始';
    const end_time = new Date(active_contest.startedAt).getTime() + active_contest.durationMinutes * 60_000;
    const remaining = Math.max(0, end_time - now);
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [active_contest, now]);

  const is_contest_active = active_contest !== null;
  const is_contest_expired = useMemo(() => {
    if (!active_contest) return false;
    const end_time = new Date(active_contest.startedAt).getTime() + active_contest.durationMinutes * 60_000;
    return now >= end_time;
  }, [active_contest, now]);

  function applyBand(band_id: typeof filters.band) {
    const band = bands.find((item) => item.id === band_id);
    if (!band) return;
    set_filters({ band: band_id, minRating: band.min, maxRating: band.max });
  }

  function updateRating(value: number) {
    set_current_rating(value);
    const band = ratingBands(value).find((item) => item.id === filters.band);
    if (band) set_filters({ minRating: band.min, maxRating: band.max });
  }

  function beginContest() {
    const picked = pickRandom(filtered_problems, problem_count).map((problem) => problem.id);
    if (picked.length > 0) start_contest(picked, duration_minutes);
  }

  function toggleContestPosition(position: Position) {
    set_contest_positions((prev) => {
      const next = new Set(prev);
      if (next.has(position)) {
        if (next.size > 1) next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  }

  function pickContestProblems() {
    set_picked_contest_problems(pickRandom(contest_pool, contest_pick_count));
  }

  const tabs: { id: ActiveTab; label: string; icon: LucideIcon; description: string }[] = [
    {
      id: 'problems',
      label: '題庫練習',
      icon: ListChecks,
      description: '依照分段篩選題目，記錄提交結果'
    },
    {
      id: 'contest',
      label: '虛擬競賽',
      icon: Swords,
      description: '從篩選結果抽題模擬比賽計時'
    },
    {
      id: 'lc-contest',
      label: '競賽抽題',
      icon: Trophy,
      description: '從 LeetCode 週賽 / 雙週賽抽取題目'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── Filter card: always visible ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>練習篩選器</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">自評分數</span>
            <input
              type="number"
              value={current_rating}
              onChange={(event) => updateRating(Number(event.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">標籤</span>
            <select
              value={filters.tag}
              onChange={(event) => set_filters({ tag: event.target.value })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部標籤</option>
              {all_tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">主題</span>
            <select
              value={topic_filter}
              onChange={(event) => {
                set_topic_filter(event.target.value);
                set_subtopic_filter('all');
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部主題</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">子分類</span>
            <select
              value={subtopic_filter}
              onChange={(event) => set_subtopic_filter(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部子分類</option>
              {visible_subtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {topic_by_id.get(subtopic.parent_id)?.title ?? '未分類'} / {subtopic.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">題型</span>
            <select
              value={filters.problemType}
              onChange={(event) =>
                set_filters({ problemType: event.target.value as typeof filters.problemType })
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部題型</option>
              <option value="template">模板</option>
              <option value="classic">經典</option>
              <option value="insight_transfer">思維</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">完成狀態</span>
            <select
              value={filters.completion}
              onChange={(event) =>
                set_filters({ completion: event.target.value as typeof filters.completion })
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">全部狀態</option>
              <option value="none">尚未練習</option>
              <option value="review">需複習</option>
              <option value="passed">已通過</option>
            </select>
          </label>
          <div className="space-y-2 text-sm lg:col-span-2">
            <span className="text-muted-foreground">分數範圍</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minRating}
                onChange={(event) => set_filters({ minRating: Number(event.target.value) })}
                className="rounded-xl border border-border bg-background px-3 py-2"
                aria-label="最低分數"
              />
              <input
                type="number"
                value={filters.maxRating ?? ''}
                onChange={(event) =>
                  set_filters({ maxRating: event.target.value ? Number(event.target.value) : null })
                }
                placeholder="無上限"
                className="rounded-xl border border-border bg-background px-3 py-2"
                aria-label="最高分數"
              />
            </div>
          </div>
          <div className="space-y-2 text-sm lg:col-span-4">
            <span className="text-muted-foreground">分段預設</span>
            <div className="flex flex-wrap gap-2">
              {bands.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => applyBand(band.id)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    filters.band === band.id
                      ? toneSelectedClass(band.tone)
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  title={band.description}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tab navigation ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-muted/40 p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => set_active_tab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active_tab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{tab.label}</span>
              {tab.id === 'contest' && is_contest_active && !is_contest_expired && (
                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: problem practice */}
      {active_tab === 'problems' && (
        <>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>題庫結果（{filtered_problems.length} 題）</CardTitle>
              {filtered_problems.length > 0 ? (
                <span className="text-sm text-muted-foreground">
                  第 {current_page} / {total_pages} 頁
                </span>
              ) : null}
            </CardHeader>
            <CardContent className="grid gap-3">
              {paged_problems.map((problem) => (
                <PracticeProblemRow
                  key={problem.id}
                  problem={problem}
                  topicTitle={topic_by_id.get(problem.topic_id)?.title ?? '未分類'}
                  onLog={(status) => log_submission(problem.id, status, problem.topic_id)}
                />
              ))}
              {filtered_problems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  目前篩選條件沒有符合的題目。
                </div>
              ) : null}
              {total_pages > 1 ? (
                <Pagination
                  currentPage={current_page}
                  totalPages={total_pages}
                  total={filtered_problems.length}
                  pageSize={kPageSize}
                  onChange={set_page}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>提交紀錄</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.length > 0 ? (
                submissions.slice(0, 12).map((submission) => {
                  const problem = problem_by_id.get(submission.problemId);
                  return (
                    <div
                      key={submission.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                    >
                      <div>
                        <p className="font-medium">{problem?.title ?? '未知題目'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <span className="rounded-full border border-border bg-accent px-3 py-1 text-sm">
                        {submissionStatusLabel(submission.status)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  尚未記錄任何提交結果。
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab: virtual contest */}
      {active_tab === 'contest' && (
        <Card>
          <CardHeader>
            <CardTitle>虛擬競賽模式</CardTitle>
            <p className="text-sm text-muted-foreground">
              從上方篩選器的結果中隨機抽取題目，設定時間後開始模擬競賽。
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Settings row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">題目數量</span>
                <input
                  type="number"
                  min={1}
                  value={problem_count}
                  onChange={(event) => set_problem_count(Number(event.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">計時分鐘</span>
                <input
                  type="number"
                  min={10}
                  value={duration_minutes}
                  onChange={(event) => set_duration_minutes(Number(event.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2"
                />
              </label>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  onClick={beginContest}
                  disabled={filtered_problems.length === 0 || is_contest_active}
                >
                  開始模擬賽
                </Button>
                {is_contest_active ? (
                  <Button type="button" variant="secondary" onClick={end_contest}>
                    結束競賽
                  </Button>
                ) : null}
              </div>
            </div>

            {filtered_problems.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠ 目前篩選結果為空，請調整上方篩選器後再開始。
              </p>
            )}

            {/* Timer */}
            <div
              className={cn(
                'rounded-2xl border p-4',
                is_contest_active && !is_contest_expired
                  ? 'border-emerald-400/40 bg-emerald-500/10'
                  : is_contest_expired
                    ? 'border-rose-400/40 bg-rose-500/10'
                    : 'border-border bg-background/50'
              )}
            >
              <p className="text-sm text-muted-foreground">{is_contest_expired ? '時間到' : '剩餘時間'}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {is_contest_expired ? '00:00' : remaining_text}
              </p>
            </div>

            {/* Contest problem list */}
            {contest_problems.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {contest_problems.map((problem) => (
                  <PracticeProblemRow
                    key={problem.id}
                    problem={problem}
                    topicTitle={topic_by_id.get(problem.topic_id)?.title ?? '未分類'}
                    onLog={(status) => log_submission(problem.id, status, problem.topic_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                按「開始模擬賽」後，競賽題目會顯示在這裡。
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: contest picker */}
      {active_tab === 'lc-contest' && (
        <Card>
          <CardHeader>
            <CardTitle>LeetCode 競賽抽題</CardTitle>
            <p className="text-sm text-muted-foreground">
              從 LeetCode 週賽 / 雙週賽題庫依難度隨機抽取題目，不受上方篩選器限制。
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Filters */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">比賽類型</span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['all', '全部'],
                      ['weekly', '週賽'],
                      ['biweekly', '雙週賽']
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set_contest_type(value as ContestType)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        contest_type === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">題目位置</span>
                <div className="flex flex-wrap gap-2">
                  {([0, 1, 2, 3] as Position[]).map((position) => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => toggleContestPosition(position)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        contest_positions.has(position)
                          ? kPositionClass[position]
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {kPositionLabels[position]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className="text-muted-foreground">難度範圍</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={contest_min_rating}
                    onChange={(event) => set_contest_min_rating(Number(event.target.value))}
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                    aria-label="最低 rating"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    value={contest_max_rating}
                    onChange={(event) => set_contest_max_rating(Number(event.target.value))}
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                    aria-label="最高 rating"
                  />
                </div>
              </div>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">抽取題數</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={contest_pick_count}
                  onChange={(event) =>
                    set_contest_pick_count(Math.max(1, Math.min(10, Number(event.target.value))))
                  }
                  className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5"
                />
              </label>
            </div>

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={pickContestProblems} disabled={contest_pool.length === 0} className="gap-2">
                <Shuffle className="h-4 w-4" aria-hidden />
                隨機抽題（{contest_pick_count} 題）
              </Button>
              {picked_contest_problems.length > 0 ? (
                <Button variant="secondary" onClick={pickContestProblems} className="gap-2">
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  重新抽取
                </Button>
              ) : null}
              <span className="text-sm text-muted-foreground">
                符合條件：{contest_pool.length} 題（來自{' '}
                {new Set(contest_pool.map((p) => p.contest.contestId)).size} 場比賽）
              </span>
            </div>

            {/* Picked problems */}
            {contest_pool.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                目前篩選條件沒有符合的題目，請調整難度範圍或題目位置。
              </div>
            )}
            {picked_contest_problems.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {picked_contest_problems.map((picked, index) => (
                  <ContestPickedProblemRow
                    key={`${picked.problem.id}-${index}`}
                    picked={picked}
                    site={leet_code_site}
                    topicTitle={
                      picked.canonicalProblem
                        ? (topic_by_id.get(picked.canonicalProblem.topic_id)?.title ?? '未分類')
                        : '未分類'
                    }
                    onLog={(status) =>
                      picked.canonicalProblem
                        ? log_submission(picked.canonicalProblem.id, status, picked.canonicalProblem.topic_id)
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : contest_pool.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                按「隨機抽題」從 LeetCode 週賽題庫抽取題目。
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContestPickedProblemRow({
  picked,
  site,
  topicTitle: topic_title,
  onLog: on_log
}: {
  picked: PickedContestProblem;
  site: 'cn' | 'en';
  topicTitle: string;
  onLog: (status: SubmissionStatus) => void;
}) {
  const canonical = picked.canonicalProblem;
  const [show_notes, set_show_notes] = useState(false);
  const problem_note = useProgressStore((state) =>
    canonical ? state.problemNotes[canonical.id] : undefined
  );

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium',
                kPositionClass[picked.position]
              )}
            >
              {kPositionLabels[picked.position]}
            </span>
            {picked.problem.premium ? (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Premium
              </span>
            ) : null}
          </div>
          {canonical ? (
            <Link
              href={`/problems/${canonical.id}`}
              className="font-medium transition-colors hover:text-primary"
            >
              {canonical.frontend_id}. {canonical.title}
            </Link>
          ) : (
            <a
              href={lcUrl(picked.problem.titleSlug, site)}
              target="_blank"
              rel="noreferrer"
              className="font-medium transition-colors hover:text-primary"
            >
              {picked.problem.id}. {picked.problem.title}
            </a>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {topic_title}・
            <a
              href={contestUrl(picked.contest.contestId, site)}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-primary"
            >
              {picked.contest.title}
            </a>
          </p>
        </div>
        <DifficultyBadge rating={picked.problem.rating} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={lcUrl(picked.problem.titleSlug, site)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          打開原題
        </a>
        {canonical ? (
          <span className="text-xs text-muted-foreground">・已併入手冊，可記錄進度</span>
        ) : (
          <span className="text-xs text-muted-foreground">・尚未對應到手冊分類</span>
        )}
        {canonical ? (
          <button
            type="button"
            onClick={() => set_show_notes(true)}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            {problem_note ? '查看解答與思路' : '記錄解答與思路'}
          </button>
        ) : null}
      </div>
      {canonical ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <span className="text-xs text-muted-foreground">記錄結果</span>
          {kStatusOptions.map((status) => {
            const label = submissionStatusLabel(status);
            const Icon = kStatusIcon[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => on_log(status)}
                title={label}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 text-xs font-medium text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  kStatusButtonClass[status]
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
      {canonical ? (
        <ProblemNotesModal
          problemId={canonical.id}
          title={problemDisplayTitle(canonical)}
          open={show_notes}
          onClose={() => set_show_notes(false)}
        />
      ) : null}
    </div>
  );
}

function PracticeProblemRow({
  problem,
  topicTitle: topic_title,
  onLog: on_log
}: {
  problem: Problem;
  topicTitle: string;
  onLog: (status: SubmissionStatus) => void;
}) {
  const [show_notes, set_show_notes] = useState(false);
  const problem_note = useProgressStore((state) => state.problemNotes[problem.id]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/problems/${problem.id}`} className="font-medium transition-colors hover:text-primary">
            {problem.title}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{topic_title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge rating={problem.rating} />
          <ProblemTypeBadge problemType={problem.problem_type} />
          <ProblemStatusControl problemId={problem.id} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ProblemSourceLink
          problem={problem}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          打開原題
        </ProblemSourceLink>
        <span className="text-xs text-muted-foreground">
          ・題型：{problemTypeLabel(problem.problem_type)}
        </span>
        <button
          type="button"
          onClick={() => set_show_notes(true)}
          className="text-sm font-medium text-primary transition hover:underline"
        >
          {problem_note ? '查看解答與思路' : '記錄解答與思路'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">記錄結果</span>
        {kStatusOptions.map((status) => {
          const label = submissionStatusLabel(status);
          const Icon = kStatusIcon[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => on_log(status)}
              title={label}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 text-xs font-medium text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                kStatusButtonClass[status]
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
      <ProblemNotesModal
        problemId={problem.id}
        title={problemDisplayTitle(problem)}
        open={show_notes}
        onClose={() => set_show_notes(false)}
      />
    </div>
  );
}

function Pagination({
  currentPage: current_page,
  totalPages: total_pages,
  total,
  pageSize: page_size,
  onChange: on_change
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = (current_page - 1) * page_size + 1;
  const to = Math.min(current_page * page_size, total);
  const pages = pageRange(current_page, total_pages);

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
      <span className="text-xs text-muted-foreground">
        顯示第 {from}–{to} 題，共 {total} 題
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => on_change(current_page - 1)}
          disabled={current_page <= 1}
          aria-label="上一頁"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        {pages.map((p, index) =>
          p === null ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => on_change(p)}
              aria-current={p === current_page ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                p === current_page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => on_change(current_page + 1)}
          disabled={current_page >= total_pages}
          aria-label="下一頁"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function pageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push(null);
    result.push(p);
    prev = p;
  }
  return result;
}
