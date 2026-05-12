import { create } from 'zustand';
import { AIOpsResult, AIOpsStep } from '@/types';

interface AIOpsStore {
  result: AIOpsResult | null;
  isRunning: boolean;

  // Actions
  setResult: (result: AIOpsResult) => void;
  updateStep: (stepId: string, updates: Partial<AIOpsStep>) => void;
  setRunning: (isRunning: boolean) => void;
  reset: () => void;
}

export const useAIOpsStore = create<AIOpsStore>((set) => ({
  result: null,
  isRunning: false,

  setResult: (result) => set({ result }),

  updateStep: (stepId, updates) =>
    set((state) => {
      if (!state.result) return state;
      return {
        result: {
          ...state.result,
          steps: state.result.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        },
      };
    }),

  setRunning: (isRunning) => set({ isRunning }),

  reset: () => set({ result: null, isRunning: false }),
}));
