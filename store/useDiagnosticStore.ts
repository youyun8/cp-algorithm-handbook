'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeSeed, type DiagnosticResponses, type MasteryLevelId } from '@/lib/diagnostic';

/** Lightweight summary of one finished assessment, kept for the trend view. */
export interface DiagnosticAttempt {
  seed: number;
  completedAt: string;
  estimatedRating: number;
  difficulty: string;
  clearedSlots: number;
  akReady: boolean;
}

/** The identity of the current attempt is its seed (see lib/diagnostic). */
const kInitialSeed = 1;
const kMaxHistory = 24;

interface DiagnosticState {
  /** Seed for the current attempt — determines which problems are shown. */
  seed: number;
  responses: DiagnosticResponses;
  /** ISO timestamp of the last time the user finished the diagnostic. */
  completedAt?: string;
  /** Past finished attempts, oldest → newest. */
  history: DiagnosticAttempt[];
  setResponse: (questionId: string, level: MasteryLevelId) => void;
  /** Mark the current attempt finished and record it in history (upsert by seed). */
  completeAttempt: (summary: Omit<DiagnosticAttempt, 'seed' | 'completedAt'>) => void;
  /** Start a fresh assessment: new seed (new problems) + cleared answers. */
  startNewAttempt: () => void;
  /** Replace local state from a synced cloud snapshot. */
  hydrate: (data: {
    seed?: number;
    responses?: DiagnosticResponses;
    completedAt?: string;
    history?: DiagnosticAttempt[];
  }) => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set) => ({
      seed: kInitialSeed,
      responses: {},
      completedAt: undefined,
      history: [],
      setResponse: (questionId, level) =>
        set((state) => ({ responses: { ...state.responses, [questionId]: level } })),
      completeAttempt: (summary) =>
        set((state) => {
          const completedAt = new Date().toISOString();
          const attempt: DiagnosticAttempt = { seed: state.seed, completedAt, ...summary };
          // Upsert by seed so editing answers updates the same attempt rather
          // than logging a duplicate; a new seed appends a new data point.
          const rest = state.history.filter((a) => a.seed !== state.seed);
          const history = [...rest, attempt].slice(-kMaxHistory);
          return { completedAt, history };
        }),
      startNewAttempt: () => set({ seed: makeSeed(), responses: {}, completedAt: undefined }),
      hydrate: (data) =>
        set((state) => ({
          seed: data.seed ?? state.seed,
          responses: data.responses ?? {},
          completedAt: data.completedAt,
          history: data.history ?? []
        }))
    }),
    {
      name: 'cp-handbook-diagnostic',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
