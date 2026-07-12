'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Pencil, RotateCcw, Sparkles, Target, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildDiagnostic,
  kContestSlots,
  kMasteryLevels,
  masteryTone,
  scoreDiagnostic,
  type LearningStep,
  type SlotReadiness
} from '@/lib/diagnostic';
import { useMounted } from '@/lib/useMounted';
import {
  cn,
  difficultyClass,
  problemDisplayTitle,
  sourceLabel,
  toneSelectedClass,
  toneSoftClass
} from '@/lib/utils';
import { useDiagnosticStore, type DiagnosticAttempt } from '@/store/useDiagnosticStore';
import { useProgressStore } from '@/store/useProgressStore';

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DiagnosticExperience() {
  const mounted = useMounted();
  const seed = useDiagnosticStore((s) => s.seed);
  const responses = useDiagnosticStore((s) => s.responses);
  const completedAt = useDiagnosticStore((s) => s.completedAt);
  const history = useDiagnosticStore((s) => s.history);
  const setResponse = useDiagnosticStore((s) => s.setResponse);
  const completeAttempt = useDiagnosticStore((s) => s.completeAttempt);
  const startNewAttempt = useDiagnosticStore((s) => s.startNewAttempt);
  const setCurrentRating = useProgressStore((s) => s.setCurrentRating);

  // Each attempt's seed picks a different-but-stable set of problems.
  const questions = useMemo(() => buildDiagnostic(seed), [seed]);

  const [editing, setEditing] = useState(false);
  const [appliedRating, setAppliedRating] = useState<number | null>(null);

  const answeredCount = questions.filter((q) => responses[q.id]).length;
  const allAnswered = answeredCount === questions.length;
  const result = useMemo(
    () => (allAnswered ? scoreDiagnostic(questions, responses) : null),
    [allAnswered, questions, responses]
  );

  // Avoid hydration mismatch from the persisted store.
  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card/50" />;
  }

  const showResult = Boolean(completedAt) && allAnswered && !editing;

  if (showResult && result) {
    return (
      <ResultView
        result={result}
        history={history}
        onRetake={() => {
          startNewAttempt();
          setEditing(false);
          setAppliedRating(null);
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onEdit={() => setEditing(true)}
        appliedRating={appliedRating}
        onApplyRating={() => {
          setCurrentRating(result.estimatedRating);
          setAppliedRating(result.estimatedRating);
        }}
      />
    );
  }

  return (
    <QuizView
      questions={questions}
      responses={responses}
      answeredCount={answeredCount}
      allAnswered={allAnswered}
      lastAttempt={history.length > 0 ? history[history.length - 1] : null}
      onSelect={setResponse}
      onSubmit={() => {
        if (result) {
          completeAttempt({
            estimatedRating: result.estimatedRating,
            difficulty: result.difficulty,
            clearedSlots: result.slots.filter((s) => s.cleared).length,
            akReady: result.akReady
          });
        }
        setEditing(false);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Quiz                                                                        */
/* -------------------------------------------------------------------------- */

interface QuizViewProps {
  questions: ReturnType<typeof buildDiagnostic>;
  responses: Record<string, string>;
  answeredCount: number;
  allAnswered: boolean;
  lastAttempt: DiagnosticAttempt | null;
  onSelect: (id: string, level: (typeof kMasteryLevels)[number]['id']) => void;
  onSubmit: () => void;
}

function QuizView({
  questions,
  responses,
  answeredCount,
  allAnswered,
  lastAttempt,
  onSelect,
  onSubmit
}: QuizViewProps) {
  return (
    <div className="space-y-6 pb-24">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> 實力診斷
          </div>
          <CardTitle className="text-2xl">18 題快速自評，量身規劃 AK 路線</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            以下題目橫跨 LeetCode 週賽的 Q1–Q4 四個難度槽。想像你在賽場上遇到每一題，誠實選出你的把握度即可 —
            不必真的作答。完成後會估算你的實力分數、找出瓶頸，並生成專屬學習路線。每次重測都會換一批題目，適合當作一段時間後的實力追蹤。
          </p>
          {lastAttempt && (
            <div className="mt-1 inline-flex flex-wrap items-center gap-2 rounded-xl border border-border bg-accent/40 px-3 py-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">上次評量</span>
              <span className="font-semibold tabular-nums">{lastAttempt.estimatedRating}</span>
              <span className="text-xs text-muted-foreground">
                （{formatAttemptDate(lastAttempt.completedAt)}）
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {kContestSlots.map((slot) => {
        const slotQuestions = questions.filter((q) => q.slot === slot.id);
        if (slotQuestions.length === 0) return null;
        return (
          <section key={slot.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-lg font-semibold tracking-tight">{slot.title}</h2>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium',
                  toneSoftClass(slot.tone)
                )}
              >
                {slot.ratingRange[0]}–{slot.ratingRange[1] >= 4000 ? '2100+' : slot.ratingRange[1]}
              </span>
              <span className="text-sm text-muted-foreground">{slot.blurb}</span>
            </div>
            <div className="space-y-3">
              {slotQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-card/70 p-4 shadow-card backdrop-blur"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md border px-1.5 py-0.5 text-xs',
                        difficultyClass(q.problem.rating)
                      )}
                    >
                      {q.problem.rating}
                    </span>
                    <span className="rounded-md border border-border bg-accent/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                      {q.topicTitle}
                    </span>
                    <Link
                      href={`/problems/${q.problem.id}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {problemDisplayTitle(q.problem)}
                    </Link>
                    <span className="text-xs text-muted-foreground">· {sourceLabel(q.problem.source)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {kMasteryLevels.map((level) => {
                      const selected = responses[q.id] === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => onSelect(q.id, level.id)}
                          title={level.hint}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-sm font-medium transition',
                            selected
                              ? toneSelectedClass(level.tone)
                              : 'border-border bg-background/40 text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {level.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>
                已完成 {answeredCount} / {questions.length}
              </span>
              <span>{pct(answeredCount / questions.length)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: pct(answeredCount / questions.length) }}
              />
            </div>
          </div>
          <Button onClick={onSubmit} disabled={!allAnswered} className="gap-1.5">
            看我的學習路線 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Result                                                                      */
/* -------------------------------------------------------------------------- */

interface ResultViewProps {
  result: ReturnType<typeof scoreDiagnostic>;
  history: DiagnosticAttempt[];
  onRetake: () => void;
  onEdit: () => void;
  onApplyRating: () => void;
  appliedRating: number | null;
}

function ResultView({ result, history, onRetake, onEdit, onApplyRating, appliedRating }: ResultViewProps) {
  // The most recent history entry is this attempt; compare against the one before.
  const previous = history.length >= 2 ? history[history.length - 2] : null;
  const delta = previous ? result.estimatedRating - previous.estimatedRating : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" /> 估算實力分數
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight tabular-nums">{result.estimatedRating}</span>
              <span className="rounded-full border border-border bg-accent/50 px-3 py-1 text-sm font-medium">
                {result.difficulty}
              </span>
              {delta !== null && (
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-sm font-medium tabular-nums',
                    delta > 0
                      ? toneSoftClass('green')
                      : delta < 0
                        ? toneSoftClass('rose')
                        : toneSoftClass('blue')
                  )}
                >
                  {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '± 0'} vs 上次
                </span>
              )}
            </div>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {result.akReady
                ? '四個難度槽都在穩定通過線以上 — 你已具備 AK 週賽的實力，接下來是保持手感與臨場穩定度。'
                : result.bottleneckSlot
                  ? `目前卡在 ${result.bottleneckSlot.label}（${result.bottleneckSlot.blurb}）。先把它突破，就能離 AK 更近一步。`
                  : '完成診斷即可查看你的瓶頸與路線。'}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:w-52">
            {result.akReady ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <Trophy className="h-4 w-4" /> AK Ready
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-accent/40 px-4 py-3 text-center text-sm text-muted-foreground">
                目標：<span className="font-semibold text-foreground">週賽 AK</span>
                <div className="mt-0.5 text-xs">
                  還差 {4 - result.slots.filter((s) => s.cleared).length} 個難度槽
                </div>
              </div>
            )}
            <Button variant="secondary" onClick={onApplyRating} className="gap-1.5">
              {appliedRating ? `已套用 ${appliedRating}` : '套用到練習場難度'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assessment trend over time */}
      {history.length >= 2 && <TrendSection history={history} />}

      {/* Slot readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">四槽通過率</CardTitle>
          <p className="text-sm text-muted-foreground">每個難度槽的把握度，低於 70% 視為尚未穩定通過。</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {result.slots.map((s) => (
            <SlotBar key={s.slot.id} readiness={s} />
          ))}
        </CardContent>
      </Card>

      {/* Topic mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">主題掌握度</CardTitle>
          <p className="text-sm text-muted-foreground">由弱到強排序，路線會優先補強最上方的缺口。</p>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {result.topics.map((t) => (
            <div key={t.topicId} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm" title={t.topicTitle}>
                {t.topicTitle}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-accent">
                <div
                  className={cn('h-full rounded-full', toneSoftClass(masteryTone(t.mastery)))}
                  style={{ width: pct(Math.max(t.mastery, 0.03)) }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {pct(t.mastery)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning path */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">
            {result.akReady ? '保持狀態的維護清單' : '你的專屬學習路線'}
          </h2>
        </div>
        {result.path.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              目前沒有明顯缺口，繼續在練習場挑戰 stretch 難度即可。
            </CardContent>
          </Card>
        ) : (
          result.path.map((step) => <PathStep key={step.topicId} step={step} />)
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="default" onClick={onRetake} className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> 換一批題目再測一次
        </Button>
        <Button variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-4 w-4" /> 修改這次的答案
        </Button>
      </div>
    </div>
  );
}

function formatAttemptDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function TrendSection({ history }: { history: DiagnosticAttempt[] }) {
  // Show the most recent attempts oldest → newest as a compact bar chart.
  const recent = history.slice(-8);
  const ratings = recent.map((a) => a.estimatedRating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = Math.max(1, max - min);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const total = last.estimatedRating - first.estimatedRating;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">實力變化</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          共 {history.length} 次評量。
          {recent.length >= 2 && (
            <>
              最近 {recent.length} 次估分{' '}
              <span
                className={cn(
                  'font-semibold',
                  total > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : total < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-foreground'
                )}
              >
                {total > 0 ? `上升 ${total}` : total < 0 ? `下降 ${-total}` : '持平'}
              </span>
              分。
            </>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 sm:gap-3">
          {recent.map((a) => {
            const heightPct = 30 + (70 * (a.estimatedRating - min)) / span;
            return (
              <div key={a.seed} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-semibold tabular-nums">{a.estimatedRating}</span>
                <div className="flex h-24 w-full items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      a.akReady ? 'bg-emerald-500/70' : 'bg-primary/60'
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${a.clearedSlots}/4 難度槽穩定通過`}
                  />
                </div>
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                  {formatAttemptDate(a.completedAt).slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SlotBar({ readiness }: { readiness: SlotReadiness }) {
  const { slot } = readiness;
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{slot.title}</span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs font-medium',
            readiness.cleared ? toneSoftClass('green') : toneSoftClass('rose')
          )}
        >
          {readiness.cleared ? '穩定通過' : '待突破'}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
          <div
            className={cn('h-full rounded-full', toneSoftClass(readiness.cleared ? 'green' : slot.tone))}
            style={{ width: pct(Math.max(readiness.readiness, 0.03)) }}
          />
        </div>
        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
          {pct(readiness.readiness)}
        </span>
      </div>
    </div>
  );
}

function PathStep({ step }: { step: LearningStep }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {step.order}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/handbook/${step.topicSlug}`}
                className="text-base font-semibold tracking-tight underline-offset-4 hover:underline"
              >
                {step.topicTitle}
              </Link>
              <span
                className={cn('rounded-full border px-2 py-0.5 text-xs', toneSoftClass(step.targetSlot.tone))}
              >
                {step.targetSlot.label}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs',
                  toneSoftClass(masteryTone(step.mastery))
                )}
              >
                掌握度 {pct(step.mastery)}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.reason}</p>
            {step.problems.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {step.problems.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        'w-12 shrink-0 rounded-md border px-1 py-0.5 text-center text-xs tabular-nums',
                        difficultyClass(p.rating)
                      )}
                    >
                      {p.rating}
                    </span>
                    <Link href={`/problems/${p.id}`} className="truncate underline-offset-4 hover:underline">
                      {problemDisplayTitle(p)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Link
                href={`/handbook/${step.topicSlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                讀手冊：{step.topicTitle} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
