import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Problem, ProblemType, RatingBand, Source, SubmissionStatus, Tier, Tone } from '@/lib/types';
import type { LeetCodeSite } from '@/store/useSettingsStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sourceLabel(source: Source) {
  const labels: Record<Source, string> = {
    leetcode: '力扣',
    codeforces: 'Codeforces',
    luogu: '洛谷',
    atcoder: 'AtCoder',
    cses: 'CSES'
  };
  return labels[source];
}

export function sourceProblemIdLabel(
  problem: Pick<Problem, 'source' | 'source_id'> & { frontend_id?: string }
) {
  if (problem.source === 'leetcode') {
    return problem.frontend_id
      ? `力扣 ID：${problem.frontend_id}・${problem.source_id}`
      : `力扣 ID：${problem.source_id}`;
  }

  return `${sourceLabel(problem.source)} ID：${problem.source_id}`;
}

export function problemDisplayTitle(problem: Pick<Problem, 'source' | 'title'> & { frontend_id?: string }) {
  if (problem.source === 'leetcode' && problem.frontend_id) {
    const prefix = `${problem.frontend_id}. `;
    if (problem.title.startsWith(prefix)) {
      return problem.title;
    }
    return `${prefix}${problem.title}`;
  }

  return problem.title;
}

export function sourceUrl(
  problem: Pick<Problem, 'source' | 'source_id'>,
  leet_code_site: LeetCodeSite = 'cn'
) {
  if (problem.source === 'leetcode') {
    const host = leet_code_site === 'en' ? 'leetcode.com' : 'leetcode.cn';
    return `https://${host}/problems/${problem.source_id}/`;
  }

  if (problem.source === 'codeforces') {
    const match = problem.source_id.match(/^(\d+)([A-Z]\d*)$/);
    return match
      ? `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`
      : 'https://codeforces.com/problemset';
  }

  if (problem.source === 'luogu') {
    return `https://www.luogu.com.cn/problem/${problem.source_id}`;
  }

  if (problem.source === 'cses') {
    return `https://cses.fi/problemset/task/${problem.source_id}`;
  }

  return `https://atcoder.jp/contests/${problem.source_id.split('_')[0]}/tasks/${problem.source_id}`;
}

export function difficultyLabel(rating: number) {
  if (rating < 1400) return '暖身';
  if (rating <= 1800) return '中等';
  if (rating < 2100) return '困難';
  return '專家';
}

// Shared difficulty/intensity colour scale. `soft` is used for badges and tags;
// `selected` is the active state for segmented controls so they read on the same
// scale (calm green -> intense rose, with blue reserved for the focus tone).
const kToneSoft: Record<Tone, string> = {
  green: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  amber: 'border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  orange: 'border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300',
  rose: 'border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
  blue: 'border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300'
};

const kToneSelected: Record<Tone, string> = {
  green:
    'border-emerald-500/60 bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-200',
  amber: 'border-amber-500/60 bg-amber-500/20 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-200',
  orange:
    'border-orange-500/60 bg-orange-500/20 text-orange-700 ring-1 ring-orange-500/30 dark:text-orange-200',
  rose: 'border-rose-500/60 bg-rose-500/20 text-rose-700 ring-1 ring-rose-500/30 dark:text-rose-200',
  blue: 'border-blue-500/60 bg-blue-500/20 text-blue-700 ring-1 ring-blue-500/30 dark:text-blue-200'
};

export function toneSoftClass(tone: Tone) {
  return kToneSoft[tone];
}

export function toneSelectedClass(tone: Tone) {
  return kToneSelected[tone];
}

export function difficultyTone(rating: number): Tone {
  if (rating < 1400) return 'green';
  if (rating <= 1800) return 'amber';
  if (rating < 2100) return 'orange';
  return 'rose';
}

export function difficultyClass(rating: number) {
  return kToneSoft[difficultyTone(rating)];
}

export function problemTypeLabel(problem_type: ProblemType) {
  const labels: Record<ProblemType, string> = {
    template: '模板',
    classic: '經典',
    insight_transfer: '思維'
  };
  return labels[problem_type];
}

export function problemTypeClass(problem_type: ProblemType) {
  const classes: Record<ProblemType, string> = {
    template: 'border-slate-400/40 bg-slate-500/15 text-slate-700 dark:text-slate-200',
    classic: 'border-blue-400/40 bg-blue-500/15 text-blue-800 dark:text-blue-200',
    insight_transfer: 'border-purple-400/40 bg-purple-500/15 text-purple-800 dark:text-purple-200'
  };
  return classes[problem_type];
}

export function tierLabel(tier: Tier) {
  const labels: Record<Tier, string> = {
    warmup: '暖身',
    core: '核心',
    advanced: '進階',
    challenge: '挑戰'
  };
  return labels[tier];
}

export function submissionStatusLabel(status: SubmissionStatus) {
  const labels: Record<SubmissionStatus, string> = {
    AC: '通過',
    WA: '答案錯誤',
    TLE: '超時',
    SKIP: '略過'
  };
  return labels[status];
}

export function topicIcon(topic_id: string) {
  const icons: Record<string, string> = {
    'binary-search': '🔍',
    'graph-traversal': '🕸️',
    intervals: '📏',
    'heap-priority-queue': '⛰️',
    'dp-fundamentals': '🧩',
    'two-pointers': '↔️',
    dsu: '🔗',
    'binary-lifting-lca': '🪜',
    'monotonic-structure': '📊',
    'segment-tree-bit': '🌳',
    'shortest-path': '🛣️',
    'minimum-spanning-tree': '🌉',
    'tree-dp': '🎋',
    'string-algorithms': '🔤',
    'math-number-theory': '🔢',
    'bitmask-dp': '🎚️',
    'computational-geometry': '📐',
    greedy: '🧠',
    backtracking: '🔙',
    'network-flow': '🌊'
  };
  return icons[topic_id] ?? '📚';
}

export function sourceClass(source: Source) {
  const classes: Record<Source, string> = {
    leetcode: 'border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-300',
    codeforces: 'border-red-400/40 bg-red-500/15 text-red-800 dark:text-red-200',
    luogu: 'border-teal-400/40 bg-teal-500/15 text-teal-800 dark:text-teal-200',
    atcoder: 'border-sky-400/40 bg-sky-500/15 text-sky-800 dark:text-sky-200',
    cses: 'border-lime-400/40 bg-lime-500/15 text-lime-800 dark:text-lime-200'
  };
  return classes[source];
}

export function ratingBands(current_rating: number): RatingBand[] {
  return [
    {
      id: 'consolidate',
      label: '鞏固',
      min: Math.max(0, current_rating - 200),
      max: current_rating,
      description: '補強目前分段的穩定度',
      tone: 'green'
    },
    {
      id: 'target',
      label: '目標',
      min: current_rating,
      max: current_rating + 200,
      description: '依照當前目標分數練習',
      tone: 'blue'
    },
    {
      id: 'stretch',
      label: '伸展',
      min: 2200,
      max: null,
      description: '選擇二二零零以上且按通過數排序',
      tone: 'orange'
    }
  ];
}
