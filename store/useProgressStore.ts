'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProblemNote, ProblemType, SubmissionStatus } from '@/lib/types';

export type CompletionFilter = 'all' | 'reviewed' | 'unreviewed' | 'accepted';
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
  activeContest?: ActiveContestSession;
  lastCloudSyncAt?: string;
  filters: PracticeFilters;
  setCurrentRating: (rating: number) => void;
  setFilters: (filters: Partial<PracticeFilters>) => void;
  markReviewed: (problem_id: string, topic_id?: string) => void;
  logSubmission: (problem_id: string, status: SubmissionStatus, topic_id?: string) => void;
  saveProblemNote: (
    problem_id: string,
    note: Partial<Pick<ProblemNote, 'solution' | 'thought' | 'language'>>
  ) => void;
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
        }
      },
      saveProblemNote: (problem_id, note) =>
        set((state) => ({
          problemNotes: {
            ...state.problemNotes,
            [problem_id]: {
              solution: note.solution ?? state.problemNotes[problem_id]?.solution ?? '',
              thought: note.thought ?? state.problemNotes[problem_id]?.thought ?? '',
              language: note.language ?? state.problemNotes[problem_id]?.language,
              updatedAt: new Date().toISOString()
            }
          }
        })),
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
          completedPracticeProblemIds: state.completedPracticeProblemIds
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
          lastCloudSyncAt: data.updatedAt ?? new Date().toISOString()
        });
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
