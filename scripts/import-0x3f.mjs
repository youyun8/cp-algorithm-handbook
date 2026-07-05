// Import 0x3F curated problem lists into the practice database.
//
//   node scripts/import-0x3f.mjs          # dry run, prints what would change
//   node scripts/import-0x3f.mjs --write  # merge new problems into problems.json
//
// Sources of truth (both machine-readable and reproducible):
//   list     -> EndlessCheng/codeforces-go leetcode/SOLUTIONS.md
//               a knowledge-point column -> problem table, the same data that
//               backs 0x3F's structured practice topic lists, sorted by difficulty.
//   ratings  -> zerotrac.github.io/leetcode_problem_rating/data.json
//               the numeric difficulty 0x3F sorts his lists by.
//
// Titles are localized Simplified -> Traditional (twp) via opencc-js, matching
// scripts/reconcile-titles.mjs. New problems receive the curated-source tag for
// filtering in the practice arena. Existing problems matched by LeetCode slug
// are never overwritten.
//
// Requires: opencc-js (already a devDependency).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';

const kRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kWrite = process.argv.includes('--write');
const kUa = 'Mozilla/5.0 (cp-handbook import-0x3f)';

const kSolutionsUrl =
  'https://raw.githubusercontent.com/EndlessCheng/codeforces-go/master/leetcode/SOLUTIONS.md';
const kRatingsUrl = 'https://zerotrac.github.io/leetcode_problem_rating/data.json';

const toTwRaw = OpenCC.Converter({ from: 'cn', to: 'twp' });
const kTwFixes = [[/擴充套件/g, '擴展']];
const toTw = (s) => kTwFixes.reduce((acc, [re, rep]) => acc.replace(re, rep), toTwRaw(s ?? ''));

// 0x3F knowledge point -> our topic id. Only confident mappings are kept; rows
// whose knowledge point has no good home (e.g. hash table, linked list, binary tree) are skipped
// so the handbook's topic taxonomy stays coherent.
const kKnowledgeToTopic = {
  滑动窗口: 'two-pointers',
  二分: 'binary-search',
  差分数组: 'intervals',
  单调栈: 'monotonic-structure',
  单调队列: 'monotonic-structure',
  '优先队列（堆）': 'heap-priority-queue',
  位运算: 'bitmask-dp',
  动态规划: 'dp-fundamentals',
  数学: 'math-number-theory',
  贪心: 'greedy',
  脑筋急转弯: 'greedy',
  构造: 'greedy',
  思维题: 'greedy',
  网格图: 'graph-traversal',
  '图 DFS': 'graph-traversal',
  基环树: 'graph-traversal',
  树: 'tree-dp',
  最短路: 'shortest-path',
  LCA: 'binary-lifting-lca',
  树状数组: 'segment-tree-bit'
};

// Difficulty label -> representative rating, used only when a problem is not in
// the zerotrac rating set (i.e. non-contest classics).
const kLabelRating = { 简单: 1200, 中等: 1600, 困难: 2200 };

// 0x3F's official roadmap discussion threads, attached to each matching topic's
// reference_links. Idempotent: skipped if already present.
const kRoadmapLinks = {
  'two-pointers': {
    label: '靈茶山艾府：滑動視窗與雙指針題單',
    url: 'https://leetcode.cn/circle/discuss/0viNMK/'
  },
  'binary-search': { label: '靈茶山艾府：二分演算法題單', url: 'https://leetcode.cn/circle/discuss/SqopEo/' },
  'monotonic-structure': {
    label: '靈茶山艾府：單調棧題單',
    url: 'https://leetcode.cn/circle/discuss/9oZFK9/'
  },
  'graph-traversal': { label: '靈茶山艾府：網格圖題單', url: 'https://leetcode.cn/circle/discuss/YiXPXW/' },
  'bitmask-dp': { label: '靈茶山艾府：位運算題單', url: 'https://leetcode.cn/circle/discuss/dHn9Vk/' },
  'shortest-path': { label: '靈茶山艾府：圖論演算法題單', url: 'https://leetcode.cn/circle/discuss/01LUak/' },
  'dp-fundamentals': { label: '靈茶山艾府：動態規劃題單', url: 'https://leetcode.cn/circle/discuss/tXLS3i/' },
  'segment-tree-bit': {
    label: '靈茶山艾府：常用資料結構題單',
    url: 'https://leetcode.cn/circle/discuss/mOr1u6/'
  },
  'math-number-theory': {
    label: '靈茶山艾府：數學演算法題單',
    url: 'https://leetcode.cn/circle/discuss/IYT3ss/'
  },
  greedy: { label: '靈茶山艾府：貪心與思維題單', url: 'https://leetcode.cn/circle/discuss/g6KTKL/' },
  'tree-dp': {
    label: '靈茶山艾府：鏈表、二叉樹與回溯題單',
    url: 'https://leetcode.cn/circle/discuss/K0n2gO/'
  },
  'string-algorithms': { label: '靈茶山艾府：字串題單', url: 'https://leetcode.cn/circle/discuss/SJFwQI/' },
  backtracking: {
    label: '靈茶山艾府：鏈表、二叉樹與回溯題單',
    url: 'https://leetcode.cn/circle/discuss/K0n2gO/'
  }
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': kUa } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.text();
}

function tierForRating(rating) {
  if (rating < 1500) return 'warmup';
  if (rating < 2000) return 'core';
  return 'challenge';
}

// Parse SOLUTIONS.md: forward-fill the knowledge point column, pull the LeetCode
// slug + frontend id + Chinese title + difficulty cell from each row.
function parseSolutions(md) {
  const rows = [];
  let knowledge = '';
  for (const line of md.split('\n')) {
    if (!line.startsWith('|') || line.startsWith('|---') || line.startsWith('|知识点')) continue;
    const cells = line.split('|').slice(1, -1);
    if (cells.length < 4) continue;
    const kp = cells[0].trim();
    if (kp) knowledge = kp;

    const link = cells[1].trim();
    const m = link.match(/\[\s*(\d+)\.\s*(.+?)\]\(https:\/\/leetcode\.cn\/problems\/([a-z0-9-]+)\/?[^)]*\)/i);
    if (!m) continue;
    rows.push({
      knowledge,
      frontendId: m[1],
      titleZH: m[2].trim(),
      slug: m[3],
      difficulty: cells[3].trim()
    });
  }
  return rows;
}

async function main() {
  const problems_path = path.join(kRoot, 'data', 'problems.json');
  const problems = JSON.parse(fs.readFileSync(problems_path, 'utf8'));
  const existing_slugs = new Set(problems.filter((p) => p.source === 'leetcode').map((p) => p.source_id));
  const existing_ids = new Set(problems.map((p) => p.id));

  const [md, ratings_json] = await Promise.all([fetchText(kSolutionsUrl), fetchText(kRatingsUrl)]);
  const rating_by_slug = new Map(JSON.parse(ratings_json).map((r) => [r.TitleSlug, r.Rating]));

  const rows = parseSolutions(md);
  const added = [];
  const seen = new Set();
  const skipped = { unmappedKnowledge: 0, duplicate: 0 };

  for (const row of rows) {
    const topic_id = kKnowledgeToTopic[row.knowledge];
    if (!topic_id) {
      skipped.unmappedKnowledge++;
      continue;
    }
    if (existing_slugs.has(row.slug) || seen.has(row.slug)) {
      skipped.duplicate++;
      continue;
    }
    seen.add(row.slug);

    let rating = rating_by_slug.get(row.slug);
    if (rating == null) {
      const numeric = Number(row.difficulty);
      rating = Number.isFinite(numeric) && numeric > 0 ? numeric : (kLabelRating[row.difficulty] ?? 1600);
    }
    rating = Math.round(rating);

    let id = `lc0x3f-${row.frontendId}`;
    while (existing_ids.has(id)) id = `${id}-b`;
    existing_ids.add(id);

    const knowledge_tw = toTw(row.knowledge);
    added.push({
      id,
      title: toTw(row.titleZH),
      source: 'leetcode',
      source_id: row.slug,
      frontend_id: row.frontendId,
      rating,
      tags: Array.from(new Set([knowledge_tw, '靈茶山艾府'])),
      topic_id: topic_id,
      problem_type: 'classic',
      tier: tierForRating(rating),
      strategy_hints: [`靈茶山艾府《如何科學刷題》${knowledge_tw}題單精選，依難度分排序練習。`],
      similar_problems: []
    });
  }

  const by_topic = {};
  for (const p of added) by_topic[p.topic_id] = (by_topic[p.topic_id] ?? 0) + 1;

  console.log(`parsed rows:         ${rows.length}`);
  console.log(`skipped (no topic):  ${skipped.unmappedKnowledge}`);
  console.log(`skipped (duplicate): ${skipped.duplicate}`);
  console.log(`new problems:        ${added.length}`);
  console.log('per topic:');
  for (const [topic, count] of Object.entries(by_topic).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${topic}`);
  }

  if (!kWrite) {
    console.log('\ndry run — pass --write to merge into data/problems.json');
    return;
  }

  const merged = [...problems, ...added];
  fs.writeFileSync(problems_path, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`\nwrote ${merged.length} problems to data/problems.json`);

  // Attach 0x3F roadmap links to the matching topics (idempotent).
  const topics_path = path.join(kRoot, 'data', 'topics.json');
  const topics = JSON.parse(fs.readFileSync(topics_path, 'utf8'));
  let linked_topics = 0;
  for (const topic of topics) {
    const link = kRoadmapLinks[topic.id];
    if (!link) continue;
    topic.reference_links = topic.reference_links ?? [];
    if (topic.reference_links.some((l) => l.url === link.url)) continue;
    topic.reference_links.push({ label: link.label, url: link.url });
    linked_topics++;
  }
  fs.writeFileSync(topics_path, `${JSON.stringify(topics, null, 2)}\n`);
  console.log(`linked 0x3F roadmap into ${linked_topics} topics`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
