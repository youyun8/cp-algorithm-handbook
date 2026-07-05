import topicsData from '@/data/topics.json';
import problemsData from '@/data/problems.json';
import subtopicsData from '@/data/subtopics.json';
import contestsData from '@/data/contests.json';
import type { Contest, Problem, Subtopic, Topic } from '@/lib/types';

export const kTopics = topicsData as Topic[];
export const kProblems = problemsData as Problem[];
export const kSubtopics = subtopicsData as Subtopic[];
export const kContests = contestsData as Contest[];

export const kTopicById = new Map(kTopics.map((topic) => [topic.id, topic]));
export const kProblemById = new Map(kProblems.map((problem) => [problem.id, problem]));

export function getTopics() {
  return kTopics;
}

export function getProblems() {
  return kProblems;
}

export function getTopicBySlug(slug: string) {
  return kTopics.find((topic) => topic.slug === slug);
}

export function getProblemsByTopic(topic_id: string) {
  return kProblems.filter((problem) => problem.topic_id === topic_id);
}

export function getProblemsBySubtopic(subtopic_id: string) {
  return kProblems.filter((problem) => problem.subtopic_ids?.includes(subtopic_id));
}

export function getProblemsByStudyPlanSection(plan: string, section_id: number) {
  return kProblems.filter((problem) =>
    problem.study_plan_refs?.some((ref) => ref.plan === plan && ref.section_id === section_id)
  );
}

export function getPracticeProblemPool({
  topicId: topic_id,
  subtopicId: subtopic_id,
  studyPlan: study_plan
}: {
  topicId?: string;
  subtopicId?: string;
  studyPlan?: string;
} = {}) {
  return kProblems.filter((problem) => {
    if (topic_id && problem.topic_id !== topic_id) return false;
    if (subtopic_id && !problem.subtopic_ids?.includes(subtopic_id)) return false;
    if (study_plan && !problem.study_plan_refs?.some((ref) => ref.plan === study_plan)) return false;
    return true;
  });
}

export function getSimilarProblems(problem: Problem) {
  return problem.similar_problems
    .map((id) => kProblemById.get(id))
    .filter((item): item is Problem => Boolean(item));
}

export function getTopicCoverage(problem_ids: string[]) {
  return new Set(
    problem_ids
      .map((id) => kProblemById.get(id)?.topic_id)
      .filter((topic_id): topic_id is string => Boolean(topic_id))
  );
}

export function getSubtopics(): Subtopic[] {
  return kSubtopics;
}

export function getSubtopicsByParent(parent_id: string): Subtopic[] {
  return kSubtopics.filter((s) => s.parent_id === parent_id);
}

export function getSubtopicBySlug(parent_slug: string, subtopic_slug: string): Subtopic | undefined {
  const topic_id = getTopicBySlug(parent_slug)?.id;
  if (!topic_id) return undefined;
  return kSubtopics.find((s) => s.parent_id === topic_id && s.slug === subtopic_slug);
}
