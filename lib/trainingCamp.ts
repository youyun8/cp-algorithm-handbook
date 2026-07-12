import { foundationModules } from './trainingCampFoundation';
import { strengtheningModules } from './trainingCampStrengthening';
import { advancedModules } from './trainingCampAdvanced';

/**
 * A single node in a lecture's hierarchical syllabus. A topic can be a pure
 * grouping heading (only `title` + `summary` + `children`) or a concrete
 * technique that also carries a C++ implementation and its complexity.
 */
export interface TrainingCampTopic {
  title: string;
  /** Professor-style explanation: what it is, why it works, when to use it. */
  summary?: string;
  /** Canonical C++ implementation, rendered as a ```cpp block. */
  code?: string;
  /** Expected time/space complexity, e.g. `O(n log n)`. */
  complexity?: string;
  /** Sub-topics, forming the hierarchical teaching outline. */
  children?: TrainingCampTopic[];
}

export interface TrainingCampModule {
  id: string;
  sourceChapter: number;
  title: string;
  leetcodeProblemIds?: string[];
  topics: TrainingCampTopic[];
}

export interface TrainingCampPhase {
  id: string;
  order: number;
  title: string;
  description: string;
  modules: TrainingCampModule[];
}

export const kTrainingCampPhases: TrainingCampPhase[] = [
  {
    id: 'foundation',
    order: 1,
    title: '起步區 · 建立解題底盤',
    description: '從 C++ 語法與基礎資料結構出發，逐步走過樹、圖、貪心、分治、高精度、搜尋與動態規劃。',
    modules: foundationModules
  },
  {
    id: 'strengthening',
    order: 2,
    title: '核心區 · 串起常用模型',
    description: '整合 STL、實用資料結構、查詢與字串、平衡搜尋樹、圖論、搜尋與動態規劃模型。',
    modules: strengtheningModules
  },
  {
    id: 'advanced',
    order: 3,
    title: '挑戰區 · 攻克高階題型',
    description: '聚焦進階資料結構、字串演算法、樹上操作、網路流與複雜動態規劃優化。',
    modules: advancedModules
  }
];

/** Count every node in a topic tree, including grouping headings. */
export function countTopics(topics: TrainingCampTopic[]): number {
  return topics.reduce((total, topic) => total + 1 + (topic.children ? countTopics(topic.children) : 0), 0);
}

export function getTrainingCampStats(phases: TrainingCampPhase[] = kTrainingCampPhases) {
  const modules = phases.flatMap((phase) => phase.modules);
  const topicCount = modules.reduce((total, module) => total + countTopics(module.topics), 0);
  const leetcodeProblemCount = new Set(modules.flatMap((module) => module.leetcodeProblemIds ?? [])).size;

  return {
    phaseCount: phases.length,
    moduleCount: modules.length,
    topicCount,
    leetcodeProblemCount
  };
}
