'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nextProblemStatus, noteHasContent } from '@/lib/problemStatus';
import type { ProblemNote, ProblemStatus, ProblemType, SubmissionStatus } from '@/lib/types';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';

export type CompletionFilter = 'all' | 'none' | 'review' | 'passed';
export type RatingBandId = 'consolidate' | 'target' | 'stretch';

export interface PracticeFilters {
  tag: string;
  minRating: number;
  maxRating: number | null;
  problemType: ProblemType | 'all';
  completion: CompletionFilter;
  band: RatingBandId;
}

export interface SubmissionLog {
  id: string;
  problemId: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface ReviewEvent {
  problemId: string;
  reviewedAt: string;
}

export interface PracticeCompletionEvent {
  problemId: string;
  completedAt: string;
}

export interface ActiveContestSession {
  id: string;
  problemIds: string[];
  durationMinutes: number;
  startedAt: string;
}

export interface ContestSessionRecord extends ActiveContestSession {
  endedAt: string;
}

interface ProgressState {
  currentRating: number;
  reviewedProblemIds: string[];
  coveredTopicIds: string[];
  submissions: SubmissionLog[];
  reviewEvents: ReviewEvent[];
  practiceCompletionEvents: PracticeCompletionEvent[];
  contestSessions: ContestSessionRecord[];
  problemNotes: Record<string, ProblemNote>;
  completedPracticeProblemIds: string[];
  problemStatuses: Record<string, ProblemStatus>;
  activeContest?: ActiveContestSession;
  lastCloudSyncAt?: string;
  filters: PracticeFilters;
  setCurrentRating: (rating: number) => void;
  setFilters: (filters: Partial<PracticeFilters>) => void;
  markReviewed: (problem_id: string, topic_id?: string) => void;
  logSubmission: (problem_id: string, status: SubmissionStatus, topic_id?: string) => void;
  setProblemStatus: (problem_id: string, status: ProblemStatus) => void;
  cycleProblemStatus: (problem_id: string, current: ProblemStatus) => void;
  saveProblemNote: (
    problem_id: string,
    note: Partial<Pick<ProblemNote, 'solution' | 'thought' | 'language'>>
  ) => void;
  clearProblemNote: (problem_id: string, field?: 'solution' | 'thought' | 'all') => void;
  markPracticeProblemCompleted: (problem_id: string) => void;
  unmarkPracticeProblemCompleted: (problem_id: string) => void;
  startContest: (problem_ids: string[], duration_minutes: number) => void;
  endContest: () => void;
  syncToCloud: () => Promise<{ ok: boolean; error?: string }>;
  loadFromCloud: () => Promise<{ ok: boolean; error?: string }>;
}

const kDefaultFilters: PracticeFilters = {
  tag: 'all',
  minRating: 1800,
  maxRating: 2000,
  problemType: 'all',
  completion: 'all',
  band: 'target'
};

function uniqueAppend(items: string[], item: string) {
  return items.includes(item) ? items : [...items, item];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentRating: 1800,
      reviewedProblemIds: [],
      coveredTopicIds: [],
      submissions: [],
      reviewEvents: [],
      practiceCompletionEvents: [],
      contestSessions: [],
      problemNotes: {},
      completedPracticeProblemIds: [],
      problemStatuses: {},
      lastCloudSyncAt: undefined,
      filters: kDefaultFilters,
      setCurrentRating: (rating) => set({ currentRating: rating }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      markReviewed: (problem_id, topic_id) =>
        set((state) => {
          const already_reviewed = state.reviewedProblemIds.includes(problem_id);
          return {
            reviewedProblemIds: uniqueAppend(state.reviewedProblemIds, problem_id),
            coveredTopicIds: topic_id ? uniqueAppend(state.coveredTopicIds, topic_id) : state.coveredTopicIds,
            reviewEvents: already_reviewed
              ? state.reviewEvents
              : [...state.reviewEvents, { problemId: problem_id, reviewedAt: new Date().toISOString() }]
          };
        }),
      logSubmission: (problem_id, status, topic_id) => {
        const submission: SubmissionLog = {
          id: createId('submission'),
          problemId: problem_id,
          status,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          submissions: [submission, ...state.submissions].slice(0, 200),
          coveredTopicIds: topic_id ? uniqueAppend(state.coveredTopicIds, topic_id) : state.coveredTopicIds
        }));

        if (status === 'AC') {
          get().markReviewed(problem_id, topic_id);
          get().setProblemStatus(problem_id, 'passed');
        }
      },
      setProblemStatus: (problem_id, status) =>
        set((state) => ({
          problemStatuses: { ...state.problemStatuses, [problem_id]: status }
        })),
      cycleProblemStatus: (problem_id, current) =>
        set((state) => ({
          problemStatuses: { ...state.problemStatuses, [problem_id]: nextProblemStatus(current) }
        })),
      saveProblemNote: (problem_id, note) =>
        set((state) => {
          const next_note = {
            solution: note.solution ?? state.problemNotes[problem_id]?.solution ?? '',
            thought: note.thought ?? state.problemNotes[problem_id]?.thought ?? '',
            language: note.language ?? state.problemNotes[problem_id]?.language,
            updatedAt: new Date().toISOString()
          };
          // Recording a note auto-promotes an untouched problem to 需複習, so
          // the status no longer contradicts the fact that work exists. An
          // explicit status the user already picked (incl. 已通過) is kept.
          const has_content = noteHasContent(next_note);
          const current_status = state.problemStatuses[problem_id];
          const problem_statuses =
            has_content && current_status === undefined
              ? { ...state.problemStatuses, [problem_id]: 'review' as ProblemStatus }
              : state.problemStatuses;
          if (!has_content) {
            const { [problem_id]: _removed_note, ...problem_notes } = state.problemNotes;
            return {
              problemNotes: problem_notes,
              problemStatuses: problem_statuses
            };
          }
          return {
            problemNotes: { ...state.problemNotes, [problem_id]: next_note },
            problemStatuses: problem_statuses
          };
        }),
      clearProblemNote: (problem_id, field = 'all') =>
        set((state) => {
          const current_note = state.problemNotes[problem_id];
          if (!current_note) return state;

          if (field === 'all') {
            const { [problem_id]: _removed_note, ...problem_notes } = state.problemNotes;
            return { problemNotes: problem_notes };
          }

          const next_note = {
            ...current_note,
            [field]: '',
            updatedAt: new Date().toISOString()
          };

          if (!noteHasContent(next_note)) {
            const { [problem_id]: _removed_note, ...problem_notes } = state.problemNotes;
            return { problemNotes: problem_notes };
          }

          return {
            problemNotes: { ...state.problemNotes, [problem_id]: next_note }
          };
        }),
      markPracticeProblemCompleted: (problem_id) =>
        set((state) => {
          const already_completed = state.completedPracticeProblemIds.includes(problem_id);
          return {
            completedPracticeProblemIds: uniqueAppend(state.completedPracticeProblemIds, problem_id),
            practiceCompletionEvents: already_completed
              ? state.practiceCompletionEvents
              : [
                  ...state.practiceCompletionEvents,
                  { problemId: problem_id, completedAt: new Date().toISOString() }
                ].slice(-200)
          };
        }),
      unmarkPracticeProblemCompleted: (problem_id) =>
        set((state) => ({
          completedPracticeProblemIds: state.completedPracticeProblemIds.filter((id) => id !== problem_id),
          practiceCompletionEvents: state.practiceCompletionEvents.filter(
            (event) => event.problemId !== problem_id
          )
        })),
      startContest: (problem_ids, duration_minutes) =>
        set({
          activeContest: {
            id: createId('contest'),
            problemIds: problem_ids,
            durationMinutes: duration_minutes,
            startedAt: new Date().toISOString()
          }
        }),
      endContest: () =>
        set((state) => {
          if (!state.activeContest) return state;
          return {
            activeContest: undefined,
            contestSessions: [
              { ...state.activeContest, endedAt: new Date().toISOString() },
              ...state.contestSessions
            ].slice(0, 50)
          };
        }),
      syncToCloud: async () => {
        const state = get();
        const payload = {
          currentRating: state.currentRating,
          reviewedProblemIds: state.reviewedProblemIds,
          coveredTopicIds: state.coveredTopicIds,
          submissions: state.submissions.slice(0, 200),
          reviewEvents: state.reviewEvents.slice(0, 200),
          practiceCompletionEvents: state.practiceCompletionEvents.slice(-200),
          contestSessions: state.contestSessions.slice(0, 50),
          problemNotes: state.problemNotes,
          completedPracticeProblemIds: state.completedPracticeProblemIds,
          problemStatuses: state.problemStatuses,
          diagnostic: {
            responses: useDiagnosticStore.getState().responses,
            completedAt: useDiagnosticStore.getState().completedAt
          }
        };
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!json.ok) return { ok: false, error: json.error };
        set({ lastCloudSyncAt: json.updatedAt ?? new Date().toISOString() });
        return { ok: true };
      },
      loadFromCloud: async () => {
        const res = await fetch('/api/progress');
        const json = await res.json();
        if (!json.data) return { ok: true }; // No saved data yet
        const data = json.data;
        set({
          currentRating: data.currentRating ?? 1800,
          reviewedProblemIds: data.reviewedProblemIds ?? [],
          coveredTopicIds: data.coveredTopicIds ?? [],
          submissions: data.submissions ?? [],
          reviewEvents: data.reviewEvents ?? [],
          practiceCompletionEvents: data.practiceCompletionEvents ?? [],
          contestSessions: data.contestSessions ?? [],
          problemNotes: data.problemNotes ?? {},
          completedPracticeProblemIds: data.completedPracticeProblemIds ?? [],
          problemStatuses: data.problemStatuses ?? {},
          lastCloudSyncAt: data.updatedAt ?? new Date().toISOString()
        });
        if (data.diagnostic) {
          useDiagnosticStore.getState().hydrate(data.diagnostic);
        }
        return { ok: true };
      }
    }),
    {
      name: 'cp-handbook-progress',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
