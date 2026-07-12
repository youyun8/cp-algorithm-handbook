import { kProblems, kTopicById } from './data';
import type { Problem, Tone } from './types';

/**
 * Diagnostic → learning-path engine.
 *
 * The app has no online judge, so the "test" is a fast self-assessment: the
 * user rates a fixed, deterministic set of calibration problems that span the
 * four LeetCode weekly-contest slots (Q1–Q4) crossed with the topics that
 * actually show up in contests. From those ratings we estimate a contest
 * rating, per-slot readiness, per-topic mastery, and generate an ordered
 * study path aimed at the ultimate goal: AK (solving all four problems).
 *
 * Everything here is pure and framework-agnostic; the questions resolve
 * deterministically from `data/problems.json`, so a given answer set always
 * produces the same result (reproducible, no randomness).
 */

export type SlotId = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface ContestSlot {
  id: SlotId;
  label: string;
  title: string;
  /** [min, max) rating window this slot roughly corresponds to. */
  ratingRange: [number, number];
  /** Representative difficulty used for rating estimation. */
  centerRating: number;
  blurb: string;
  tone: Tone;
}

export const kContestSlots: ContestSlot[] = [
  {
    id: 'Q1',
    label: 'Q1',
    title: 'Q1 · 簽到題',
    ratingRange: [0, 1400],
    centerRating: 1350,
    blurb: '送分題，要求穩、快、零失誤。',
    tone: 'green'
  },
  {
    id: 'Q2',
    label: 'Q2',
    title: 'Q2 · 常規中等',
    ratingRange: [1400, 1700],
    centerRating: 1600,
    blurb: '基本模型的直接套用，週賽的基本盤。',
    tone: 'amber'
  },
  {
    id: 'Q3',
    label: 'Q3',
    title: 'Q3 · 分水嶺',
    ratingRange: [1700, 2100],
    centerRating: 1950,
    blurb: '要選對演算法並正確實作，晉級的關鍵。',
    tone: 'orange'
  },
  {
    id: 'Q4',
    label: 'Q4',
    title: 'Q4 · AK 門檻',
    ratingRange: [2100, 4000],
    centerRating: 2400,
    blurb: '進階模型或多步轉換，AK 成敗都在這一題。',
    tone: 'rose'
  }
];

export const kSlotById = new Map(kContestSlots.map((slot) => [slot.id, slot]));

export type MasteryLevelId = 'solid' | 'shaky' | 'hint' | 'unknown';

export interface MasteryLevel {
  id: MasteryLevelId;
  label: string;
  hint: string;
  /** Contribution to readiness/mastery, in [0, 1]. */
  weight: number;
  tone: Tone;
}

export const kMasteryLevels: MasteryLevel[] = [
  { id: 'solid', label: '秒殺', hint: '看到就知道怎麼寫，能穩定 AC', weight: 1, tone: 'green' },
  { id: 'shaky', label: '想一下能寫', hint: '需要推敲，但最終能獨立完成', weight: 0.6, tone: 'amber' },
  { id: 'hint', label: '要看提示', hint: '會卡住，得看題解或提示才寫得出來', weight: 0.25, tone: 'orange' },
  { id: 'unknown', label: '沒頭緒', hint: '完全不知道從何下手', weight: 0, tone: 'rose' }
];

export const kMasteryById = new Map(kMasteryLevels.map((level) => [level.id, level]));

/** Threshold above which a slot counts as "reliably cleared". */
export const kSlotClearThreshold = 0.7;

/**
 * Which (topic, slot) cells the diagnostic probes. Chosen so that (a) every
 * slot has several items, (b) the most contest-frequent topics recur across
 * slots for stable per-topic aggregation, and (c) each cell resolves to a real
 * LeetCode problem in the dataset.
 */
interface ProbeBlueprint {
  topicId: string;
  slot: SlotId;
}

const kProbeBlueprint: ProbeBlueprint[] = [
  // Q1 — sign-in
  { topicId: 'two-pointers', slot: 'Q1' },
  { topicId: 'greedy', slot: 'Q1' },
  { topicId: 'heap-priority-queue', slot: 'Q1' },
  // Q2 — bread and butter
  { topicId: 'greedy', slot: 'Q2' },
  { topicId: 'two-pointers', slot: 'Q2' },
  { topicId: 'binary-search', slot: 'Q2' },
  { topicId: 'intervals', slot: 'Q2' },
  { topicId: 'math-number-theory', slot: 'Q2' },
  // Q3 — the divide
  { topicId: 'dp-fundamentals', slot: 'Q3' },
  { topicId: 'binary-search', slot: 'Q3' },
  { topicId: 'monotonic-structure', slot: 'Q3' },
  { topicId: 'graph-traversal', slot: 'Q3' },
  { topicId: 'heap-priority-queue', slot: 'Q3' },
  { topicId: 'greedy', slot: 'Q3' },
  // Q4 — AK gate
  { topicId: 'dp-fundamentals', slot: 'Q4' },
  { topicId: 'bitmask-dp', slot: 'Q4' },
  { topicId: 'graph-traversal', slot: 'Q4' },
  { topicId: 'segment-tree-bit', slot: 'Q4' }
];

export interface DiagnosticQuestion {
  id: string;
  problem: Problem;
  topicId: string;
  topicTitle: string;
  slot: SlotId;
}

/** Small deterministic PRNG (mulberry32) so a seed reproduces a question set. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh random seed for a new assessment attempt. */
export function makeSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/** How many of the most-representative problems form the randomisation pool. */
const kProbePoolSize = 12;

function pickProbeProblem(
  topicId: string,
  slot: SlotId,
  used: Set<string>,
  rng?: () => number
): Problem | undefined {
  const [lo, hi] = kSlotById.get(slot)!.ratingRange;
  const inCell = kProblems.filter(
    (p) => p.topic_id === topicId && p.rating >= lo && p.rating < hi && !used.has(p.id)
  );
  if (inCell.length === 0) return undefined;
  // Rank by how canonical the problem is: LeetCode first (contest-relevant,
  // recognisable), then most-solved.
  const ranked = inCell.sort((a, b) => {
    const lcA = a.source === 'leetcode' ? 1 : 0;
    const lcB = b.source === 'leetcode' ? 1 : 0;
    if (lcA !== lcB) return lcB - lcA;
    return (b.solve_count ?? 0) - (a.solve_count ?? 0);
  });
  // Deterministic (no seed): always the single canonical representative.
  if (!rng) return ranked[0];
  // Seeded: pick from a pool of the top representatives so retakes vary while
  // still showing well-known problems at the right difficulty.
  const leetcode = ranked.filter((p) => p.source === 'leetcode');
  const base = leetcode.length >= 4 ? leetcode : ranked;
  const pool = base.slice(0, Math.min(kProbePoolSize, base.length));
  return pool[Math.floor(rng() * pool.length)] ?? ranked[0];
}

/**
 * Build a diagnostic question set.
 *
 * Question ids are keyed by `topicId:slot` (the *cell*), not the concrete
 * problem, so scoring is stable regardless of which representative problem is
 * shown. Passing a `seed` picks a different-but-reproducible problem per cell —
 * this is what lets each retake feel like a fresh assessment while a given
 * attempt always renders the same problems.
 */
export function buildDiagnostic(seed?: number): DiagnosticQuestion[] {
  const used = new Set<string>();
  const rng = seed != null ? mulberry32(seed) : undefined;
  const questions: DiagnosticQuestion[] = [];
  for (const probe of kProbeBlueprint) {
    const problem = pickProbeProblem(probe.topicId, probe.slot, used, rng);
    if (!problem) continue;
    used.add(problem.id);
    questions.push({
      id: `${probe.topicId}:${probe.slot}`,
      problem,
      topicId: probe.topicId,
      topicTitle: kTopicById.get(probe.topicId)?.title ?? probe.topicId,
      slot: probe.slot
    });
  }
  return questions;
}

export type DiagnosticResponses = Record<string, MasteryLevelId>;

export interface SlotReadiness {
  slot: ContestSlot;
  readiness: number;
  answered: number;
  total: number;
  cleared: boolean;
}

export interface TopicMastery {
  topicId: string;
  topicTitle: string;
  mastery: number;
  answered: number;
  /** Lowest slot at which this topic was probed and found weak. */
  weakestSlot: SlotId | null;
}

export interface LearningStep {
  order: number;
  topicId: string;
  topicTitle: string;
  topicSlug: string;
  targetSlot: ContestSlot;
  mastery: number;
  reason: string;
  problems: Problem[];
}

export interface DiagnosticResult {
  estimatedRating: number;
  difficulty: string;
  akReady: boolean;
  bottleneckSlot: ContestSlot | null;
  slots: SlotReadiness[];
  topics: TopicMastery[];
  path: LearningStep[];
}

function slotOrder(id: SlotId): number {
  return kContestSlots.findIndex((s) => s.id === id);
}

/** Estimate the rating where self-reported success probability crosses 0.5. */
function estimateRating(slots: SlotReadiness[]): number {
  const points: { rating: number; value: number }[] = [{ rating: 1000, value: 1 }];
  for (const s of slots) points.push({ rating: s.slot.centerRating, value: s.readiness });

  let estimate = points[0].rating;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (b.value >= 0.5) {
      estimate = b.rating;
      continue;
    }
    // Readiness dips below 0.5 between a and b — interpolate the crossing.
    const span = a.value - b.value;
    const t = span > 0 ? (a.value - 0.5) / span : 0;
    estimate = a.rating + t * (b.rating - a.rating);
    break;
  }
  const clamped = Math.max(1000, Math.min(2600, estimate));
  return Math.round(clamped / 10) * 10;
}

function difficultyLabelForRating(rating: number): string {
  if (rating < 1400) return '週賽新手';
  if (rating < 1700) return '穩過 Q2';
  if (rating < 2050) return '衝擊 Q3';
  if (rating < 2350) return '準 AK';
  return 'AK 選手';
}

/** Practice-band picker for a study step, biased just below the target slot. */
function recommendProblems(topicId: string, slot: ContestSlot, exclude: Set<string>): Problem[] {
  const lo = Math.max(0, slot.ratingRange[0] - 150);
  const hi = slot.ratingRange[1];
  return kProblems
    .filter((p) => p.topic_id === topicId && p.rating >= lo && p.rating < hi && !exclude.has(p.id))
    .sort((a, b) => {
      const lcA = a.source === 'leetcode' ? 1 : 0;
      const lcB = b.source === 'leetcode' ? 1 : 0;
      if (lcA !== lcB) return lcB - lcA;
      if (a.rating !== b.rating) return a.rating - b.rating; // easier → harder within band
      return (b.solve_count ?? 0) - (a.solve_count ?? 0);
    })
    .slice(0, 5);
}

/**
 * Score a completed diagnostic and generate a personalised learning path.
 * Unanswered questions are treated as weight 0.
 */
export function scoreDiagnostic(
  questions: DiagnosticQuestion[],
  responses: DiagnosticResponses
): DiagnosticResult {
  // Per-slot readiness.
  const slots: SlotReadiness[] = kContestSlots.map((slot) => {
    const items = questions.filter((q) => q.slot === slot.id);
    const total = items.length;
    let sum = 0;
    let answered = 0;
    for (const q of items) {
      const level = responses[q.id];
      if (level) {
        answered += 1;
        sum += kMasteryById.get(level)?.weight ?? 0;
      }
    }
    const readiness = total > 0 ? sum / total : 0;
    return { slot, readiness, answered, total, cleared: readiness >= kSlotClearThreshold };
  });

  // Per-topic mastery.
  const topicMap = new Map<string, { sum: number; answered: number; weakestSlot: SlotId | null }>();
  for (const q of questions) {
    const level = responses[q.id];
    const weight = level ? (kMasteryById.get(level)?.weight ?? 0) : 0;
    const entry = topicMap.get(q.topicId) ?? { sum: 0, answered: 0, weakestSlot: null };
    if (level) entry.answered += 1;
    entry.sum += weight;
    // Track the lowest (easiest) slot where the topic is shaky or worse.
    if (weight < 0.6) {
      if (entry.weakestSlot === null || slotOrder(q.slot) < slotOrder(entry.weakestSlot)) {
        entry.weakestSlot = q.slot;
      }
    }
    topicMap.set(q.topicId, entry);
  }
  const topicCounts = new Map<string, number>();
  for (const q of questions) topicCounts.set(q.topicId, (topicCounts.get(q.topicId) ?? 0) + 1);

  const topics: TopicMastery[] = [...topicMap.entries()]
    .map(([topicId, entry]) => ({
      topicId,
      topicTitle: kTopicById.get(topicId)?.title ?? topicId,
      mastery: entry.sum / (topicCounts.get(topicId) ?? 1),
      answered: entry.answered,
      weakestSlot: entry.weakestSlot
    }))
    .sort((a, b) => a.mastery - b.mastery);

  const estimatedRating = estimateRating(slots);
  const bottleneck = slots.find((s) => !s.cleared) ?? null;
  const akReady = slots.every((s) => s.cleared);

  // Build the ordered learning path.
  const path = buildPath(topics, bottleneck?.slot ?? null, akReady);

  return {
    estimatedRating,
    difficulty: difficultyLabelForRating(estimatedRating),
    akReady,
    bottleneckSlot: bottleneck?.slot ?? null,
    slots,
    topics,
    path
  };
}

function buildPath(topics: TopicMastery[], bottleneck: ContestSlot | null, akReady: boolean): LearningStep[] {
  // Don't push someone struggling at Q1 straight into Q4-only topics: cap the
  // recommended difficulty one slot above the current bottleneck.
  const ceilingIndex = akReady
    ? kContestSlots.length - 1
    : Math.min(kContestSlots.length - 1, slotOrder(bottleneck?.id ?? 'Q1') + 1);

  const candidates = topics.filter((t) => {
    if (t.mastery >= 0.85) return false; // already solid — skip
    // Keep topics whose weak slot is within reach of the current ceiling.
    if (t.weakestSlot === null) return t.mastery < 0.6;
    return slotOrder(t.weakestSlot) <= ceilingIndex;
  });

  const chosen = (candidates.length > 0 ? candidates : topics).slice(0, 4);
  const used = new Set<string>();

  return chosen.map((t, index) => {
    const targetSlotId = t.weakestSlot ?? bottleneck?.id ?? 'Q3';
    const targetSlot = kSlotById.get(targetSlotId)!;
    const problems = recommendProblems(t.topicId, targetSlot, used);
    for (const p of problems) used.add(p.id);
    const pct = Math.round(t.mastery * 100);
    return {
      order: index + 1,
      topicId: t.topicId,
      topicTitle: t.topicTitle,
      topicSlug: kTopicById.get(t.topicId)?.slug ?? t.topicId,
      targetSlot,
      mastery: t.mastery,
      reason: `${t.topicTitle} 常在 ${targetSlot.label} 出現，你目前掌握度約 ${pct}%，是通往 AK 的關鍵缺口。先讀手冊建立框架，再把下列題目刷穩。`,
      problems
    };
  });
}

export function masteryTone(mastery: number): Tone {
  if (mastery >= 0.75) return 'green';
  if (mastery >= 0.5) return 'amber';
  if (mastery >= 0.25) return 'orange';
  return 'rose';
}
