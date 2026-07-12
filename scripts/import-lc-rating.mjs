// Import lc-rating study plans into the cp-handbook canonical data model.
//
//   node scripts/import-lc-rating.mjs          # dry run
//   node scripts/import-lc-rating.mjs --write  # update data/*.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kWrite = process.argv.includes('--write');
const kUa = 'Mozilla/5.0 (cp-handbook import-lc-rating)';
const kRemote = 'https://raw.githubusercontent.com/youyun8/lc-rating/main/apps/web';

const kStudyPlans = [
  'binary_search',
  'greedy',
  'dynamic_programming',
  'data_structure',
  'graph',
  'sliding_window',
  'monotonic_stack',
  'math',
  'string',
  'trees',
  'bitwise_operations',
  'grid',
  'sorting'
];

const kPlanToTopic = {
  binary_search: 'binary-search',
  greedy: 'greedy',
  dynamic_programming: 'dp-fundamentals',
  data_structure: 'heap-priority-queue',
  graph: 'graph-traversal',
  sliding_window: 'two-pointers',
  monotonic_stack: 'monotonic-structure',
  math: 'math-number-theory',
  string: 'string-algorithms',
  trees: 'tree-dp',
  bitwise_operations: 'bitmask-dp',
  grid: 'graph-traversal',
  sorting: 'intervals'
};

const kTitleTopicRules = [
  [/二分|第\s*K|最小化最大值|最大化最小值|三分/, 'binary-search'],
  [/滑動視窗|雙指標|相向|同向|三指標|分組迴圈/, 'two-pointers'],
  [/單調堆疊|單調棧|單調佇列|矩形|字典序/, 'monotonic-structure'],
  [/堆|優先佇列|Top-?K|第\s*K/, 'heap-priority-queue'],
  [/並查集/, 'dsu'],
  [/樹狀陣列|線段樹|Fenwick|Sparse Table|ST 表|可持久化/, 'segment-tree-bit'],
  [/最短路|Dijkstra|Floyd|SPFA|0-1 BFS|分層圖/, 'shortest-path'],
  [/最小生成樹|Kruskal|MST/, 'minimum-spanning-tree'],
  [/LCA|最近公共祖先|倍增/, 'binary-lifting-lca'],
  [/樹形 DP|換根|樹的直徑|一般樹|二叉樹|N 叉樹/, 'tree-dp'],
  [/網路流|費用流/, 'network-flow'],
  [/回溯|排列|組合|子集|折半列舉/, 'backtracking'],
  [/KMP|Z 函式|Manacher|字串|字典樹|Trie|後綴|AC 自動機|雜湊/, 'string-algorithms'],
  [/狀壓|位運算|異或|AND|OR|線性基|拆位|試填/, 'bitmask-dp'],
  [/DP|背包|LCS|LIS|劃分|狀態機|數位|區間 DP|優化 DP|博弈 DP|機率\/期望 DP/, 'dp-fundamentals'],
  [/數學|數論|質數|GCD|LCM|組合|容斥|博弈|幾何|凸包|曼哈頓|多項式|FWT|隨機/, 'math-number-theory'],
  [/區間|差分|字首和|掃描線|排序|計數排序|基數排序|桶排序/, 'intervals'],
  [/圖|DFS|BFS|拓撲|基環|連通|二分圖|網格/, 'graph-traversal'],
  [/貪心|交換論證|反悔|構造|腦筋|逆向|中位數|不等式/, 'greedy']
];

const kRoadmapLinks = {
  binary_search: { label: 'lc-rating：二分搜尋題單', url: `${kRemote}/public/studyplan/binary_search.json` },
  greedy: { label: 'lc-rating：貪心與思維題單', url: `${kRemote}/public/studyplan/greedy.json` },
  dynamic_programming: {
    label: 'lc-rating：動態規劃題單',
    url: `${kRemote}/public/studyplan/dynamic_programming.json`
  },
  data_structure: {
    label: 'lc-rating：資料結構題單',
    url: `${kRemote}/public/studyplan/data_structure.json`
  },
  graph: { label: 'lc-rating：圖論題單', url: `${kRemote}/public/studyplan/graph.json` },
  sliding_window: {
    label: 'lc-rating：滑動視窗與雙指標題單',
    url: `${kRemote}/public/studyplan/sliding_window.json`
  },
  monotonic_stack: {
    label: 'lc-rating：單調堆疊題單',
    url: `${kRemote}/public/studyplan/monotonic_stack.json`
  },
  math: { label: 'lc-rating：數學題單', url: `${kRemote}/public/studyplan/math.json` },
  string: { label: 'lc-rating：字串題單', url: `${kRemote}/public/studyplan/string.json` },
  trees: { label: 'lc-rating：樹、鏈結串列與回溯題單', url: `${kRemote}/public/studyplan/trees.json` },
  bitwise_operations: {
    label: 'lc-rating：位元運算題單',
    url: `${kRemote}/public/studyplan/bitwise_operations.json`
  },
  grid: { label: 'lc-rating：網格圖題單', url: `${kRemote}/public/studyplan/grid.json` },
  sorting: { label: 'lc-rating：排序題單', url: `${kRemote}/public/studyplan/sorting.json` }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(kRoot, file), 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(kRoot, file), `${JSON.stringify(data, null, 2)}\n`);
}

async function fetchJson(url) {
  let last_status = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': kUa } });
    if (res.ok) return res.json();
    last_status = res.status;
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw new Error(`GET ${url} -> HTTP ${last_status}`);
}

function cleanTitle(title) {
  return title.replace(/^\d+(?:\.\d+)*\s*/, '').trim();
}

function slugifyPart(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function topicFor(plan, section_path) {
  const text = section_path.join(' / ');
  for (const [pattern, topic_id] of kTitleTopicRules) {
    if (pattern.test(text)) return topic_id;
  }
  return kPlanToTopic[plan];
}

function tierForRating(rating) {
  if (rating < 1500) return 'warmup';
  if (rating < 1900) return 'core';
  if (rating < 2300) return 'advanced';
  return 'challenge';
}

function problemTypeFor(section_title, rating) {
  if (/基礎|入門|模板|遍歷/.test(section_title) || rating < 1450) return 'template';
  if (/思維|構造|腦筋|等價|逆向|貢獻|分類|互動|特殊/.test(section_title)) return 'insight_transfer';
  return 'classic';
}

function topicForTags(tag_names) {
  return topicFor('data_structure', tag_names);
}

function ratingFor(item, problem_info) {
  const value = item.score ?? item.difficulty ?? problem_info?.rating;
  if (Number.isFinite(value)) return Math.round(value);
  if (item.difficultyLabel === '簡單' || item.difficultyLabel === 'Easy') return 1200;
  if (item.difficultyLabel === '困難' || item.difficultyLabel === 'Hard') return 2200;
  return 1600;
}

function collectLeafSections(root) {
  const sections = [];

  function visit(node, path_titles) {
    const title = cleanTitle(node.title);
    const next_path = [...path_titles, title];
    if (node.problems?.length) {
      sections.push({ node, pathTitles: next_path });
    }
    for (const child of node.children ?? []) visit(child, next_path);
  }

  for (const child of root.children ?? []) visit(child, []);
  return sections;
}

function sectionCoreIdea(parent_topic_id, title, path_titles) {
  const path_label = path_titles.join(' → ');
  const base = `這一節把「${path_label}」當成一個可辨識的解題訊號：先判斷題目限制與目標形式，再選擇對應的不變式、資料結構或轉換方式。練習時不要只記題名，而要把每題歸納成「何時觸發、狀態如何表示、為什麼複雜度足夠」三件事。`;
  const topic_notes = {
    greedy: '貪心章節的重點是證明局部選擇安全：可用交換論證、反悔堆、剩餘空間最大化或必要條件構造來檢查。',
    'binary-search': '二分章節的重點是先寫出單調 predicate，並明確回傳第一個合法值或最後一個合法值。',
    'dp-fundamentals': 'DP 章節的重點是從暴力搜尋合併同類狀態，先定義狀態語意，再確認轉移依賴順序。',
    'graph-traversal': '圖論章節的重點是先定義節點、邊與狀態維度，再根據邊權和依賴關係選 BFS、DFS 或拓撲序。',
    'shortest-path': '最短路章節的重點是先看邊權：等權用 BFS，0/1 權用 deque，非負權用 Dijkstra。',
    'segment-tree-bit':
      '資料結構章節的重點是維護查詢所需的不變式，讓更新後仍能快速回答前綴、區間或順序統計。',
    'monotonic-structure': '單調結構章節的重點是讓每個元素只進出一次，並在破壞單調性時確定答案或貢獻邊界。'
  };
  return `${base}\n\n${topic_notes[parent_topic_id] ?? '本節題目按 rating 由淺入深排列，適合先做暖身與核心題，再挑戰需要組合多個技巧的題。'}`;
}

function sectionDeepDive(title, path_titles, problem_count) {
  return [
    {
      title: '題目訊號與建模',
      body: `看到「${path_titles.join(' → ')}」類題時，先把題目問法翻成可操作的模型：答案是位置、數值、集合、路徑、區間還是構造結果；輸入限制暗示需要 O(n)、O(n log n)、O(log V) 還是狀態壓縮。模型確定後，再選用手冊主題頁中的核心模板。`
    },
    {
      title: '練習順序',
      body: `本節從 lc-rating 題單整理出 ${problem_count} 題。建議先做 rating 較低的暖身題建立模板肌肉記憶，再做核心題訓練邊界，最後挑戰高 rating 或標記為思維轉換的題目；每題做完都回到本節的觸發條件，檢查自己是否能在新敘述中辨認同一個模式。`
    }
  ];
}

function supplementalPatterns(title, problem_count) {
  return [
    {
      name: '觸發條件',
      description: `題目敘述若出現「${title}」對應的結構、限制或最優化目標，就先嘗試把它歸入本節模型，再檢查是否需要和其他章節技巧組合。`
    },
    {
      name: '複盤方式',
      description: `做完本節 ${problem_count} 題後，整理每題的狀態定義、關鍵不變式與失敗邊界；若只記得程式碼，換一個包裝敘述時仍然容易失手。`
    }
  ];
}

function makeStudyRef(plan, plan_title, section, path_titles) {
  return {
    plan,
    plan_title: plan_title,
    section_id: section.id,
    section_title: cleanTitle(section.title),
    section_path: path_titles
  };
}

function addUniqueByValue(items, additions) {
  const seen = new Set(items);
  for (const item of additions) {
    if (!seen.has(item)) {
      seen.add(item);
      items.push(item);
    }
  }
  return items;
}

function addStudyRef(refs, ref) {
  const exists = refs.some((item) => item.plan === ref.plan && item.section_id === ref.section_id);
  return exists ? refs : [...refs, ref];
}

function mergeProblemMetadata(target, duplicate) {
  target.tags = addUniqueByValue(target.tags ?? [], duplicate.tags ?? []);
  target.subtopic_ids = addUniqueByValue(target.subtopic_ids ?? [], duplicate.subtopic_ids ?? []);
  target.study_plan_refs = (duplicate.study_plan_refs ?? []).reduce(
    (refs, ref) => addStudyRef(refs, ref),
    target.study_plan_refs ?? []
  );
  target.strategy_hints = addUniqueByValue(target.strategy_hints ?? [], duplicate.strategy_hints ?? []);
  target.similar_problems = addUniqueByValue(target.similar_problems ?? [], duplicate.similar_problems ?? []);
  target.source_url ??= duplicate.source_url;
  target.solve_count ??= duplicate.solve_count;
  target.insight_note ??= duplicate.insight_note;
}

function dedupeLeetcodeProblems(problems, subtopics) {
  const by_slug = new Map();
  const duplicate_to_primary = new Map();
  const deduped = [];

  for (const problem of problems) {
    if (problem.source !== 'leetcode') {
      deduped.push(problem);
      continue;
    }
    // Older imports sometimes stored slugs as `/two-sum/`. Treat that as the
    // same canonical key as `two-sum`, otherwise refreshes create duplicates.
    problem.source_id = problem.source_id.replace(/^\/+|\/+$/g, '');
    const primary = by_slug.get(problem.source_id);
    if (!primary) {
      by_slug.set(problem.source_id, problem);
      deduped.push(problem);
      continue;
    }
    mergeProblemMetadata(primary, problem);
    duplicate_to_primary.set(problem.id, primary.id);
  }

  for (const problem of deduped) {
    problem.similar_problems = Array.from(
      new Set(
        (problem.similar_problems ?? [])
          .map((id) => duplicate_to_primary.get(id) ?? id)
          .filter((id) => id !== problem.id)
      )
    );
  }
  for (const subtopic of subtopics) {
    if (!subtopic.problem_ids) continue;
    subtopic.problem_ids = Array.from(
      new Set(subtopic.problem_ids.map((id) => duplicate_to_primary.get(id) ?? id))
    );
  }

  return { problems: deduped, removed: duplicate_to_primary.size };
}

function normalizeContests(contests_raw, problemset) {
  const rows = Array.isArray(contests_raw) ? contests_raw : Object.values(contests_raw);
  return rows
    .map((contest) => {
      const contest_id = contest.contestId ?? contest.titleSlug ?? contest.id;
      const type = contest.type ?? (String(contest_id).includes('biweekly') ? 'biweekly' : 'weekly');
      const number = contest.number ?? Number(String(contest_id).match(/(\d+)$/)?.[1] ?? contest.id ?? 0);
      return {
        contestId: contest_id,
        title: contest.title,
        type,
        number,
        time: contest.time,
        problems: (contest.problems ?? contest.problemIds ?? []).map((problem) => {
          if (problem == null) return null;
          if (typeof problem === 'object' && problem.titleSlug) return problem;
          const info = problemset[String(problem)];
          if (!info) return null;
          return {
            id: info.id,
            title: info.title,
            titleSlug: info.titleSlug,
            rating: Math.round(info.rating ?? 0),
            premium: Boolean(info.premium)
          };
        })
      };
    })
    .sort((a, b) => b.time - a.time);
}

async function main() {
  const topics = readJson('data/topics.json');
  const subtopics = readJson('data/subtopics.json');
  const problems = readJson('data/problems.json');

  const topic_ids = new Set(topics.map((topic) => topic.id));
  const problemset = await fetchJson(`${kRemote}/public/problemset/problems.json`);
  const tags = await fetchJson(`${kRemote}/public/problemset/tags.json`);
  let contests;
  try {
    const contests_raw = await fetchJson(`${kRemote}/public/problemset/contests.json`);
    contests = normalizeContests(contests_raw, problemset);
  } catch (error) {
    console.warn(`warning: ${error.message}; keeping local data/contests.json`);
    contests = readJson('data/contests.json');
  }

  const existing_subtopics = subtopics.filter((subtopic) => !subtopic.id.startsWith('lc-rating-'));
  const subtopic_by_id = new Map(existing_subtopics.map((subtopic) => [subtopic.id, subtopic]));
  const problem_by_slug = new Map(
    problems.filter((problem) => problem.source === 'leetcode').map((problem) => [problem.source_id, problem])
  );
  const problem_by_id = new Map(problems.map((problem) => [problem.id, problem]));
  const generated_subtopics = [];
  const generated_by_topic = new Map();
  const stats = {
    sections: 0,
    newSubtopics: 0,
    newProblems: 0,
    newContestProblems: 0,
    updatedProblems: 0,
    missingTopic: 0
  };

  for (const plan of kStudyPlans) {
    const root = await fetchJson(`${kRemote}/public/studyplan/${plan}.json`);
    const sections = collectLeafSections(root);
    const roadmap = kRoadmapLinks[plan];

    for (const { node, pathTitles: path_titles } of sections) {
      const topic_id = topicFor(plan, path_titles);
      if (!topic_ids.has(topic_id)) {
        stats.missingTopic++;
        continue;
      }
      stats.sections++;
      const subtopic_id = `lc-rating-${slugifyPart(plan)}-${node.id}`;
      const subtopic_title = cleanTitle(node.title);
      const study_ref = makeStudyRef(plan, root.title, node, path_titles);
      const subtopic = {
        id: subtopic_id,
        parent_id: topic_id,
        title: subtopic_title,
        slug: subtopic_id.replace(/^lc-rating-/, ''),
        description: `${root.title}中的「${path_titles.join(' / ')}」題型整理，已併入手冊章節作為分級練習路徑。`,
        core_idea: sectionCoreIdea(topic_id, subtopic_title, path_titles),
        complexity: '依所選模型而定；請以本主題核心模板的複雜度為準。',
        deep_dive: sectionDeepDive(subtopic_title, path_titles, node.problems.length),
        reference_links: roadmap ? [roadmap] : [],
        supplemental_patterns: supplementalPatterns(subtopic_title, node.problems.length),
        pitfalls: [
          '⚠️ 不要只根據題目標籤選演算法；必須確認限制、單調性、狀態維度或貪心證明真的成立。',
          '⚠️ 同一題可能同時屬於多個章節，複盤時要寫下本節視角下的關鍵轉換，避免只留下題號。'
        ],
        practice_problems: [],
        study_plan_ref: study_ref,
        problem_ids: []
      };

      subtopic_by_id.set(subtopic_id, subtopic);
      generated_subtopics.push(subtopic);
      generated_by_topic.set(topic_id, [...(generated_by_topic.get(topic_id) ?? []), subtopic_id]);
      stats.newSubtopics++;

      for (const item of node.problems) {
        const info = problemset[item.id] ?? Object.values(problemset).find((p) => p.titleSlug === item.slug);
        const rating = ratingFor(item, info);
        const tag_names = (info?.tagIds ?? [])
          .map((tag_id) => tags[tag_id]?.zh)
          .filter(Boolean)
          .slice(0, 5);
        const base_tags = [subtopic_title, cleanTitle(root.title.split('（')[0]), 'lc-rating', ...tag_names];
        const existing = problem_by_slug.get(item.slug);
        if (existing) {
          const before = JSON.stringify({
            subtopic_ids: existing.subtopic_ids,
            study_plan_refs: existing.study_plan_refs,
            tags: existing.tags
          });
          existing.subtopic_ids = addUniqueByValue(existing.subtopic_ids ?? [], [subtopic_id]);
          existing.study_plan_refs = addStudyRef(existing.study_plan_refs ?? [], study_ref);
          existing.tags = addUniqueByValue(existing.tags ?? [], base_tags);
          existing.source_url ??= item.src;
          subtopic.problem_ids.push(existing.id);
          if (
            JSON.stringify({
              subtopic_ids: existing.subtopic_ids,
              study_plan_refs: existing.study_plan_refs,
              tags: existing.tags
            }) !== before
          ) {
            stats.updatedProblems++;
          }
          continue;
        }

        let id = `lc-${slugifyPart(item.id) || slugifyPart(item.slug)}`;
        let suffix = 2;
        while (problem_by_id.has(id)) id = `lc-${slugifyPart(item.id) || slugifyPart(item.slug)}-${suffix++}`;

        const created = {
          id,
          title: item.title,
          source: 'leetcode',
          source_id: item.slug,
          frontend_id: String(item.id),
          rating,
          tags: Array.from(new Set(base_tags)),
          topic_id: topic_id,
          subtopic_ids: [subtopic_id],
          study_plan_refs: [study_ref],
          origin: 'lc-rating-studyplan',
          source_url: item.src,
          problem_type: problemTypeFor(path_titles.join(' '), rating),
          tier: tierForRating(rating),
          strategy_hints: [
            `lc-rating「${path_titles.join(' → ')}」題單題目，先辨認本節模型再動手寫模板。`,
            `rating 約 ${rating}，適合放在「${tierForRating(rating)}」階段練習。`
          ],
          insight_note: /思維|構造|腦筋|等價|逆向|分類/.test(path_titles.join(' '))
            ? '這題重點通常不在套模板，而在把題目敘述轉成手冊中的已知模型。'
            : undefined,
          similar_problems: []
        };
        problems.push(created);
        problem_by_id.set(id, created);
        problem_by_slug.set(item.slug, created);
        subtopic.problem_ids.push(id);
        stats.newProblems++;
      }
    }
  }

  for (const info of Object.values(problemset)) {
    if (!info?.titleSlug || problem_by_slug.has(info.titleSlug)) continue;
    const rating = Math.round(info.rating ?? 0) || 1600;
    const tag_names = (info.tagIds ?? []).map((tag_id) => tags[tag_id]?.zh).filter(Boolean);
    const topic_id = topicForTags(tag_names);
    if (!topic_ids.has(topic_id)) {
      stats.missingTopic++;
      continue;
    }
    let id = `lc-${slugifyPart(info.id) || slugifyPart(info.titleSlug)}`;
    let suffix = 2;
    while (problem_by_id.has(id))
      id = `lc-${slugifyPart(info.id) || slugifyPart(info.titleSlug)}-${suffix++}`;

    const created = {
      id,
      title: info.title,
      source: 'leetcode',
      source_id: info.titleSlug,
      frontend_id: String(info.id),
      rating,
      tags: Array.from(new Set(['lc-rating', '競賽題庫', ...tag_names.slice(0, 6)])),
      topic_id: topic_id,
      subtopic_ids: [],
      study_plan_refs: [],
      origin: 'lc-rating-contest',
      source_url: `https://leetcode.cn/problems/${info.titleSlug}/`,
      problem_type: problemTypeFor(tag_names.join(' '), rating),
      tier: tierForRating(rating),
      strategy_hints: [
        'lc-rating 競賽題庫題目；先依標籤判斷可能模型，再回到手冊對應章節複盤。',
        `rating 約 ${rating}，可作為練習場隨機抽題或分數帶訓練。`
      ],
      similar_problems: []
    };
    problems.push(created);
    problem_by_id.set(id, created);
    problem_by_slug.set(info.titleSlug, created);
    stats.newProblems++;
    stats.newContestProblems++;
  }

  const all_subtopics = [...existing_subtopics, ...generated_subtopics];
  for (const topic of topics) {
    const generated_children = generated_by_topic.get(topic.id) ?? [];
    if (generated_children.length > 0) {
      topic.children = addUniqueByValue(topic.children ?? [], generated_children);
      topic.reference_links = topic.reference_links ?? [];
      for (const plan of kStudyPlans) {
        const link = kRoadmapLinks[plan];
        if (!link) continue;
        if (!generated_children.some((id) => subtopic_by_id.get(id)?.study_plan_ref?.plan === plan)) continue;
        if (!topic.reference_links.some((item) => item.url === link.url)) {
          topic.reference_links.push(link);
        }
      }
    }
  }

  const deduped = dedupeLeetcodeProblems(problems, all_subtopics);

  console.log(`study plan sections: ${stats.sections}`);
  console.log(`generated subtopics: ${stats.newSubtopics}`);
  console.log(`new problems:        ${stats.newProblems}`);
  console.log(`contest-only added:  ${stats.newContestProblems}`);
  console.log(`updated problems:    ${stats.updatedProblems}`);
  console.log(`deduped problems:    ${deduped.removed}`);
  console.log(`missing topic:        ${stats.missingTopic}`);
  console.log(`contests:             ${contests.length}`);

  if (!kWrite) {
    console.log('\ndry run - pass --write to update data files');
    return;
  }

  writeJson('data/topics.json', topics);
  writeJson('data/subtopics.json', all_subtopics);
  writeJson('data/problems.json', deduped.problems);
  writeJson('data/contests.json', contests);
  console.log('\nwrote data/topics.json, data/subtopics.json, data/problems.json, data/contests.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
