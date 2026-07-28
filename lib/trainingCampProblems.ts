import advancedProblems from '@/data/training-camp-problems-advanced.json';
import foundationProblems from '@/data/training-camp-problems-foundation.json';
import strengtheningProblems from '@/data/training-camp-problems-strengthening.json';

export interface TrainingCampProblem {
  id: string;
  title: string;
  origin: string;
  originalUrl: string;
  moduleId: string;
  moduleIds?: string[];
  section: string;
  summary: string;
  hints: string[];
  analysis: string;
  skeleton: string;
  solution: string;
}

const kRawTrainingCampProblems: TrainingCampProblem[] = [
  ...foundationProblems,
  ...strengtheningProblems,
  ...advancedProblems
] as TrainingCampProblem[];

const kMergedProblems = new Map<string, TrainingCampProblem>();
for (const problem of kRawTrainingCampProblems) {
  const existing = kMergedProblems.get(problem.id);
  if (!existing) {
    kMergedProblems.set(problem.id, problem);
    continue;
  }

  const moduleIds = new Set([
    existing.moduleId,
    ...(existing.moduleIds ?? []),
    problem.moduleId,
    ...(problem.moduleIds ?? [])
  ]);
  kMergedProblems.set(problem.id, {
    ...existing,
    moduleIds: [...moduleIds],
    section: `${existing.section}；${problem.section}`
  });
}

export const kTrainingCampProblems = [...kMergedProblems.values()];

export const kTrainingCampProblemById = new Map(
  kTrainingCampProblems.map((problem) => [problem.id, problem])
);

export function trainingCampProblemsForModule(moduleId: string) {
  return kTrainingCampProblems.filter(
    (problem) => problem.moduleId === moduleId || problem.moduleIds?.includes(moduleId)
  );
}
