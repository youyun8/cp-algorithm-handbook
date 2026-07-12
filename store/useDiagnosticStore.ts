'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DiagnosticResponses, MasteryLevelId } from '@/lib/diagnostic';

interface DiagnosticState {
  responses: DiagnosticResponses;
  /** ISO timestamp of the last time the user finished the diagnostic. */
  completedAt?: string;
  setResponse: (questionId: string, level: MasteryLevelId) => void;
  markCompleted: () => void;
  reset: () => void;
  /** Replace local state from a synced cloud snapshot. */
  hydrate: (data: { responses?: DiagnosticResponses; completedAt?: string }) => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set) => ({
      responses: {},
      completedAt: undefined,
      setResponse: (questionId, level) =>
        set((state) => ({ responses: { ...state.responses, [questionId]: level } })),
      markCompleted: () => set({ completedAt: new Date().toISOString() }),
      reset: () => set({ responses: {}, completedAt: undefined }),
      hydrate: (data) => set({ responses: data.responses ?? {}, completedAt: data.completedAt })
    }),
    {
      name: 'cp-handbook-diagnostic',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);
