import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(kRoot, file), 'utf8'));
}

function fail(errors) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(errors.length > 0 ? 1 : 0);
}

const kTopics = readJson('data/topics.json');
const kSubtopics = readJson('data/subtopics.json');
const kProblems = readJson('data/problems.json');

const kErrors = [];
const kTopicIds = new Set(kTopics.map((topic) => topic.id));
const kTopicSlugs = new Set();
const kSubtopicIds = new Set(kSubtopics.map((subtopic) => subtopic.id));
const kSubtopicRoutes = new Set();
const kProblemIds = new Set();
const kLeetcodeSlugs = new Map();
const kSourceProblemKeys = new Map();
const kSources = new Set(['leetcode', 'codeforces', 'luogu', 'atcoder', 'cses']);
const kProblemTypes = new Set(['template', 'classic', 'insight_transfer']);
const kTiers = new Set(['warmup', 'core', 'advanced', 'challenge']);

function requireText(owner, field, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    kErrors.push(`${owner} has empty ${field}`);
  }
}

function checkTeachingDocument(document, kind) {
  const owner = `${kind} ${document.id}`;
  for (const field of ['id', 'title', 'slug', 'description', 'core_idea', 'complexity']) {
    requireText(owner, field, document[field]);
  }
  if (!Array.isArray(document.reference_links) || document.reference_links.length === 0) {
    kErrors.push(`${owner} has no reference links`);
  }
  for (const link of document.reference_links ?? []) {
    requireText(owner, 'reference label', link.label);
    try {
      const url = new URL(link.url);
      if (url.protocol !== 'https:') kErrors.push(`${owner} has non-HTTPS reference: ${link.url}`);
    } catch {
      kErrors.push(`${owner} has invalid reference URL: ${link.url}`);
    }
  }
  for (const section of document.deep_dive ?? []) {
    requireText(owner, 'deep-dive title', section.title);
    requireText(owner, `deep-dive body (${section.title})`, section.body);
    if (((section.body.match(/```/g) ?? []).length & 1) !== 0) {
      kErrors.push(`${owner} has unbalanced code fences in ${section.title}`);
    }
  }
}

for (const topic of kTopics) {
  checkTeachingDocument(topic, 'topic');
  if (kTopicSlugs.has(topic.slug)) kErrors.push(`duplicate topic slug: ${topic.slug}`);
  kTopicSlugs.add(topic.slug);
  for (const child_id of topic.children ?? []) {
    if (!kSubtopicIds.has(child_id)) kErrors.push(`${topic.id} references missing subtopic ${child_id}`);
  }
  for (const subtopic of kSubtopics.filter((item) => item.parent_id === topic.id)) {
    if (!(topic.children ?? []).includes(subtopic.id)) {
      kErrors.push(`${topic.id} omits child subtopic ${subtopic.id}`);
    }
  }
}

for (const subtopic of kSubtopics) {
  checkTeachingDocument(subtopic, 'subtopic');
  if (!kTopicIds.has(subtopic.parent_id)) {
    kErrors.push(`${subtopic.id} has missing parent topic ${subtopic.parent_id}`);
  }
  const route = `${subtopic.parent_id}/${subtopic.slug}`;
  if (kSubtopicRoutes.has(route)) kErrors.push(`duplicate subtopic route: ${route}`);
  kSubtopicRoutes.add(route);
  for (const problem_id of subtopic.problem_ids ?? []) {
    const problem = kProblems.find((item) => item.id === problem_id);
    if (!problem) {
      kErrors.push(`${subtopic.id} references missing problem ${problem_id}`);
    } else if (!(problem.subtopic_ids ?? []).includes(subtopic.id)) {
      kErrors.push(`${subtopic.id} references ${problem_id}, but the problem lacks the reciprocal tag`);
    }
  }
  const practice_keys = new Set();
  for (const problem of subtopic.practice_problems ?? []) {
    if (!kSources.has(problem.source))
      kErrors.push(`${subtopic.id} has invalid practice source ${problem.source}`);
    requireText(`${subtopic.id} practice problem`, 'title', problem.title);
    requireText(`${subtopic.id} practice problem`, 'source_id', problem.source_id);
    const key = `${problem.source}:${problem.source_id}`;
    if (practice_keys.has(key)) kErrors.push(`${subtopic.id} repeats practice problem ${key}`);
    practice_keys.add(key);
  }
}

for (const problem of kProblems) {
  if (kProblemIds.has(problem.id)) kErrors.push(`duplicate problem id: ${problem.id}`);
  kProblemIds.add(problem.id);
  for (const field of ['id', 'title', 'source_id', 'topic_id']) {
    requireText(`problem ${problem.id}`, field, problem[field]);
  }
  if (!kSources.has(problem.source)) kErrors.push(`${problem.id} has invalid source ${problem.source}`);
  const source_key = `${problem.source}:${problem.source_id}`;
  const source_duplicate = kSourceProblemKeys.get(source_key);
  if (source_duplicate) {
    kErrors.push(`duplicate source problem ${source_key}: ${source_duplicate}, ${problem.id}`);
  } else {
    kSourceProblemKeys.set(source_key, problem.id);
  }
  if (problem.source === 'leetcode' && /^\/|\/$/.test(problem.source_id)) {
    kErrors.push(`${problem.id} has a non-canonical LeetCode slug: ${problem.source_id}`);
  }
  if (problem.source === 'leetcode' && !/^[A-Za-z0-9-]+$/.test(problem.source_id)) {
    kErrors.push(`${problem.id} has an invalid LeetCode slug shape: ${problem.source_id}`);
  }
  if (!kProblemTypes.has(problem.problem_type)) {
    kErrors.push(`${problem.id} has invalid problem_type ${problem.problem_type}`);
  }
  if (!kTiers.has(problem.tier)) kErrors.push(`${problem.id} has invalid tier ${problem.tier}`);
  if (!Number.isFinite(problem.rating) || problem.rating < 0) {
    kErrors.push(`${problem.id} has invalid rating ${problem.rating}`);
  }
  if (!Array.isArray(problem.strategy_hints) || problem.strategy_hints.length === 0) {
    kErrors.push(`${problem.id} has no strategy hints`);
  }
  if (!kTopicIds.has(problem.topic_id)) kErrors.push(`${problem.id} has missing topic ${problem.topic_id}`);
  for (const subtopic_id of problem.subtopic_ids ?? []) {
    if (!kSubtopicIds.has(subtopic_id)) kErrors.push(`${problem.id} has missing subtopic ${subtopic_id}`);
    const subtopic = kSubtopics.find((item) => item.id === subtopic_id);
    if (subtopic && !(subtopic.problem_ids ?? []).includes(problem.id)) {
      kErrors.push(`${problem.id} tags ${subtopic_id}, but the subtopic lacks the reciprocal problem id`);
    }
  }
  const similar_ids = new Set();
  for (const similar_id of problem.similar_problems ?? []) {
    if (!kProblems.some((item) => item.id === similar_id)) {
      kErrors.push(`${problem.id} references missing similar problem ${similar_id}`);
    }
    if (similar_id === problem.id) kErrors.push(`${problem.id} lists itself as a similar problem`);
    if (similar_ids.has(similar_id)) kErrors.push(`${problem.id} repeats similar problem ${similar_id}`);
    similar_ids.add(similar_id);
  }
  if (problem.source === 'leetcode') {
    const existing = kLeetcodeSlugs.get(problem.source_id);
    if (existing) {
      kErrors.push(`duplicate LeetCode slug ${problem.source_id}: ${existing}, ${problem.id}`);
    } else {
      kLeetcodeSlugs.set(problem.source_id, problem.id);
    }
  }
}

for (const file of [
  'lib/trainingCampFoundation.ts',
  'lib/trainingCampStrengthening.ts',
  'lib/trainingCampAdvanced.ts'
]) {
  const source = fs.readFileSync(path.join(kRoot, file), 'utf8');
  for (const match of source.matchAll(/leetcodeProblemIds:\s*\[([\s\S]*?)\]/g)) {
    const ids = [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
    const seen = new Set();
    for (const id of ids) {
      if (!kProblemIds.has(id)) kErrors.push(`${file} references missing training problem ${id}`);
      if (seen.has(id)) kErrors.push(`${file} repeats training problem ${id} in one module`);
      seen.add(id);
    }
  }
}

if (kErrors.length === 0) {
  console.log(
    `data ok: ${kTopics.length} topics, ${kSubtopics.length} subtopics, ${kProblems.length} problems, ${kLeetcodeSlugs.size} LeetCode slugs`
  );
}

fail(kErrors);
