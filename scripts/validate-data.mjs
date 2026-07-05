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

for (const topic of kTopics) {
  if (kTopicSlugs.has(topic.slug)) kErrors.push(`duplicate topic slug: ${topic.slug}`);
  kTopicSlugs.add(topic.slug);
  for (const child_id of topic.children ?? []) {
    if (!kSubtopicIds.has(child_id)) kErrors.push(`${topic.id} references missing subtopic ${child_id}`);
  }
}

for (const subtopic of kSubtopics) {
  if (!kTopicIds.has(subtopic.parent_id)) {
    kErrors.push(`${subtopic.id} has missing parent topic ${subtopic.parent_id}`);
  }
  const route = `${subtopic.parent_id}/${subtopic.slug}`;
  if (kSubtopicRoutes.has(route)) kErrors.push(`duplicate subtopic route: ${route}`);
  kSubtopicRoutes.add(route);
  for (const problem_id of subtopic.problem_ids ?? []) {
    if (!kProblems.some((problem) => problem.id === problem_id)) {
      kErrors.push(`${subtopic.id} references missing problem ${problem_id}`);
    }
  }
}

for (const problem of kProblems) {
  if (kProblemIds.has(problem.id)) kErrors.push(`duplicate problem id: ${problem.id}`);
  kProblemIds.add(problem.id);
  if (!kTopicIds.has(problem.topic_id)) kErrors.push(`${problem.id} has missing topic ${problem.topic_id}`);
  for (const subtopic_id of problem.subtopic_ids ?? []) {
    if (!kSubtopicIds.has(subtopic_id)) kErrors.push(`${problem.id} has missing subtopic ${subtopic_id}`);
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

if (kErrors.length === 0) {
  console.log(
    `data ok: ${kTopics.length} topics, ${kSubtopics.length} subtopics, ${kProblems.length} problems, ${kLeetcodeSlugs.size} LeetCode slugs`
  );
}

fail(kErrors);
