import Link from 'next/link';
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Route,
  TriangleAlert,
  ExternalLink as LeetIcon
} from 'lucide-react';
import { kProblemById } from '@/lib/data';
import { countTopics, type TrainingCampPhase, type TrainingCampTopic } from '@/lib/trainingCamp';
import { getTrainingCampNote } from '@/lib/trainingCampNotes';
import { InlineMarkdown } from '@/components/MarkdownBlock';
import { CodeReveal } from '@/components/CodeReveal';
import type { Problem } from '@/lib/types';
import { cn, difficultyClass, problemDisplayTitle, sourceUrl } from '@/lib/utils';

const kPhaseTone: Record<string, string> = {
  foundation: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  strengthening: 'border-blue-400/40 bg-blue-500/10 text-blue-800 dark:text-blue-200',
  advanced: 'border-rose-400/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
};

function phaseModuleOffset(phases: TrainingCampPhase[], phase_id: string) {
  let offset = 0;
  for (const phase of phases) {
    if (phase.id === phase_id) return offset;
    offset += phase.modules.length;
  }
  return offset;
}

/** Recursively render a lecture's hierarchical syllabus with teaching content. */
function TopicTree({
  topics,
  moduleId,
  depth = 0
}: {
  topics: TrainingCampTopic[];
  moduleId: string;
  depth?: number;
}) {
  return (
    <ol
      className={cn(
        'space-y-3',
        depth > 0 && 'mt-3 space-y-3 border-l-2 border-border/60 pl-4'
      )}
    >
      {topics.map((topic, index) => {
        const isLeafConcept = Boolean(topic.summary || topic.code);

        return (
          <li
            key={`${moduleId}-${depth}-${index}-${topic.title}`}
            className={cn(
              'rounded-xl border px-4 py-3',
              depth === 0
                ? 'border-border bg-background/45'
                : 'border-border/70 bg-background/25'
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                {index + 1}
              </span>
              <h4
                className={cn(
                  'font-semibold',
                  depth === 0 ? 'text-base' : 'text-sm'
                )}
              >
                {topic.title}
              </h4>
              {topic.complexity ? (
                <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-200">
                  {topic.complexity}
                </span>
              ) : null}
              {!isLeafConcept && topic.children ? (
                <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {topic.children.length} 個子題
                </span>
              ) : null}
            </div>

            {topic.summary ? (
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                <InlineMarkdown>{topic.summary}</InlineMarkdown>
              </p>
            ) : null}

            {topic.code ? (
              <CodeReveal code={topic.code} title={topic.title} complexity={topic.complexity} />
            ) : null}

            {topic.children && topic.children.length > 0 ? (
              <TopicTree topics={topic.children} moduleId={moduleId} depth={depth + 1} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function TrainingCampOverview({
  phases,
  stats
}: {
  phases: TrainingCampPhase[];
  stats: {
    phaseCount: number;
    moduleCount: number;
    topicCount: number;
    leetcodeProblemCount: number;
  };
}) {
  const stat_cards = [
    { label: '階段', value: stats.phaseCount, icon: Route },
    { label: '重編講次', value: stats.moduleCount, icon: BookOpen },
    { label: '知識節點', value: stats.topicCount, icon: ListChecks },
    { label: 'LeetCode 題', value: stats.leetcodeProblemCount, icon: LeetIcon }
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">訓練營</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">競程訓練營路線</h1>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                將三份原始章節重編為連續的 {stats.moduleCount}{' '}
                講，分成入門、提升、進階三個階段。每一講的每個子標題都附上概念說明、C++
                實作與複雜度，像教授授課般由淺入深，讓你照著清單就能學會。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stat_cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-card/80 p-4 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <card.icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <p className="mt-3 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="訓練營階段" className="grid gap-3 md:grid-cols-3">
        {phases.map((phase) => {
          const offset = phaseModuleOffset(phases, phase.id);
          const from = offset + 1;
          const to = offset + phase.modules.length;

          return (
            <a
              key={phase.id}
              href={`#${phase.id}`}
              className={cn(
                'rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover',
                kPhaseTone[phase.id]
              )}
            >
              <p className="text-sm font-semibold">第 {phase.order} 階段</p>
              <p className="mt-1 text-xl font-bold">{phase.title}</p>
              <p className="mt-2 text-sm leading-6 opacity-85">
                第 {from} 講 - 第 {to} 講，共 {phase.modules.length} 講
              </p>
            </a>
          );
        })}
      </nav>

      <div className="space-y-10">
        {phases.map((phase) => {
          const offset = phaseModuleOffset(phases, phase.id);

          return (
            <section key={phase.id} id={phase.id} className="scroll-mt-24 space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary">第 {phase.order} 階段</p>
                <h2 className="mt-1 text-2xl font-bold">{phase.title}</h2>
                <p className="mt-2 max-w-4xl leading-7 text-muted-foreground">{phase.description}</p>
              </div>

              <div className="space-y-3">
                {phase.modules.map((module, module_index) => {
                  const global_index = offset + module_index + 1;
                  const topic_count = countTopics(module.topics);
                  const note = getTrainingCampNote(module.id);
                  const leetcode_problems = (module.leetcodeProblemIds ?? [])
                    .map((problem_id) => kProblemById.get(problem_id))
                    .filter((problem): problem is Problem => Boolean(problem));

                  return (
                    <details
                      key={module.id}
                      className="group rounded-2xl border border-border bg-card/80 shadow-card"
                    >
                      <summary className="grid cursor-pointer list-none gap-3 p-4 marker:hidden sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                            {String(global_index).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              第 {global_index} 講 · 原第 {module.sourceChapter} 章
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">{module.title}</h3>
                          </div>
                        </div>

                        <p className="text-sm leading-6 text-muted-foreground sm:justify-self-start">
                          {topic_count} 個知識節點，{leetcode_problems.length} 題 LeetCode
                        </p>

                        <ChevronDown
                          className="h-5 w-5 text-muted-foreground transition group-open:rotate-180 sm:justify-self-end"
                          aria-hidden
                        />
                      </summary>

                      <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                        {note ? (
                          <div className="mb-5 rounded-2xl border border-blue-400/30 bg-blue-500/[0.06] p-4">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden />
                              <p className="text-sm font-semibold">本講重點</p>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                              <InlineMarkdown>{note.summary}</InlineMarkdown>
                            </p>
                          </div>
                        ) : null}

                        <p className="mb-3 text-sm font-semibold">教材大綱</p>
                        <TopicTree topics={module.topics} moduleId={module.id} />

                        {note ? (
                          <div className="mt-5 space-y-4 border-t border-border pt-4">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold">實作要點</p>
                              <div className="grid gap-3 md:grid-cols-2">
                                {note.implementations.map((impl) => (
                                  <div
                                    key={`${module.id}-${impl.title}`}
                                    className="flex flex-col rounded-2xl border border-border bg-background/55 p-4"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <h4 className="text-sm font-semibold">{impl.title}</h4>
                                      {impl.complexity ? (
                                        <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-200">
                                          {impl.complexity}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                      <InlineMarkdown>{impl.idea}</InlineMarkdown>
                                    </p>
                                    {impl.code ? (
                                      <CodeReveal
                                        code={impl.code}
                                        title={impl.title}
                                        complexity={impl.complexity}
                                      />
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/[0.06] p-4">
                              <div className="flex items-center gap-2">
                                <TriangleAlert
                                  className="h-4 w-4 text-rose-600 dark:text-rose-300"
                                  aria-hidden
                                />
                                <p className="text-sm font-semibold">容易踩雷</p>
                              </div>
                              <ul className="mt-2 space-y-2">
                                {note.pitfalls.map((pitfall) => (
                                  <li
                                    key={`${module.id}-${pitfall}`}
                                    className="flex gap-2 text-sm leading-7 text-rose-900 dark:text-rose-100"
                                  >
                                    <span
                                      aria-hidden
                                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500/70"
                                    />
                                    <span className="min-w-0 flex-1">
                                      <InlineMarkdown>{pitfall}</InlineMarkdown>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {note.tips ? (
                              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.06] p-4">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />
                                  <p className="text-sm font-semibold">快速上手技巧</p>
                                </div>
                                <ul className="mt-2 space-y-2">
                                  {note.tips.map((tip) => (
                                    <li key={`${module.id}-tip-${tip}`} className="flex gap-2 text-sm leading-7 text-emerald-900 dark:text-emerald-100">
                                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/70" />
                                      <span className="min-w-0 flex-1">
                                        <InlineMarkdown>{tip}</InlineMarkdown>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {leetcode_problems.length > 0 ? (
                          <div className="mt-5 border-t border-border pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold">LeetCode 同類題</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  對應本講概念的遷移練習；部分進階 OI 主題使用最接近的 LeetCode 類型題。
                                </p>
                              </div>
                              <span className="rounded-full border border-border bg-background/55 px-3 py-1 text-xs text-muted-foreground">
                                {leetcode_problems.length} 題
                              </span>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {leetcode_problems.map((problem) => (
                                <div
                                  key={problem.id}
                                  className="flex min-h-40 flex-col rounded-2xl border border-border bg-background/55 p-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                                      LC {problem.frontend_id ?? problem.source_id}
                                    </span>
                                    <span
                                      className={cn(
                                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                                        difficultyClass(problem.rating)
                                      )}
                                    >
                                      {problem.rating}
                                    </span>
                                  </div>

                                  <Link
                                    href={`/problems/${problem.id}`}
                                    className="mt-3 line-clamp-2 text-sm font-semibold leading-6 transition hover:text-primary"
                                  >
                                    {problemDisplayTitle(problem)}
                                  </Link>

                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {problem.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={`${problem.id}-${tag}`}
                                        className="rounded-full border border-border bg-accent/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                                    <a
                                      href={sourceUrl(problem)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                                    >
                                      原題
                                      <ExternalLink className="h-3 w-3" aria-hidden />
                                    </a>
                                    <Link
                                      href={`/problems/${problem.id}`}
                                      className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                                    >
                                      策略
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
